import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import crypto from "node:crypto";
import { fileURLToPath } from "url";
import multer from "multer";
import { config } from "./config.js";
import { db, getAdminByUsername, updateAdminPassword, verifyPassword, hashPassword } from "./db.js";
import { requireAdmin } from "./auth.js";
import { toWhatsAppUrl } from "./utils.js";

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json());
app.use(morgan("dev"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const legacyAssetsDir = path.resolve(__dirname, "../../assets");
const uploadsDir = path.resolve(__dirname, "..", config.uploadsDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeBase = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, "");
    const ext = (path.extname(file.originalname) || ".jpg").toLowerCase();
    cb(null, `${Date.now()}-${safeBase || "product"}${ext}`);
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  }
});

app.use("/api/assets", express.static(legacyAssetsDir));
app.use("/assets", express.static(legacyAssetsDir));
app.use("/api/uploads", express.static(uploadsDir));

function mapProduct(row) {
  const images = db.prepare("SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order, id").all(row.id).map((item) => item.image_url);
  return {
    id: row.id,
    title: row.title,
    level: row.level,
    examType: row.exam_type,
    priceDh: row.price_dh,
    stock: row.stock,
    imageUrl: row.image_url,
    imageUrls: images.length ? images : row.image_url ? [row.image_url] : [],
    description: row.description,
    createdAt: row.created_at
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "pruefungstore-backend" });
});

app.get("/api/products", (req, res) => {
  const { search = "", level = "", examType = "" } = req.query;
  const rows = db
    .prepare(
      `SELECT * FROM products
       WHERE (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))
       AND (? = '' OR LOWER(level) LIKE LOWER(?))
       AND (? = '' OR LOWER(exam_type) = LOWER(?))
       ORDER BY id DESC`
    )
    .all(`%${search}%`, `%${search}%`, String(level), `%${level}%`, String(examType), String(examType));

  res.json(rows.map(mapProduct));
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  const cleanUsername = String(username || "").trim();
  const cleanPassword = String(password || "");

  if (!cleanUsername || !cleanPassword) {
    return res.status(401).json({ message: "Veuillez renseigner le nom d'utilisateur et le mot de passe" });
  }

  const user = getAdminByUsername(cleanUsername);
  if (user) {
    const valid = verifyPassword(cleanPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Identifiants administrateur incorrects" });
    }
    return res.json({
      token: user.token || config.adminToken,
      username: user.username
    });
  }

  const okUser = cleanUsername.toLowerCase() === config.adminUsername.toLowerCase();
  const okPass = cleanPassword === config.adminPassword;

  if (!okUser || !okPass) {
    return res.status(401).json({ message: "Identifiants administrateur incorrects" });
  }

  res.json({
    token: config.adminToken,
    username: config.adminUsername
  });
});

app.post("/api/admin/change-password", requireAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const cleanCurrent = String(currentPassword || "");
  const cleanNew = String(newPassword || "");

  if (!cleanCurrent || !cleanNew) {
    return res.status(400).json({ message: "Veuillez saisir le mot de passe actuel et le nouveau mot de passe" });
  }

  if (cleanNew.length < 6) {
    return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
  }

  const admin = req.adminUser;
  if (!admin || !admin.id) {
    return res.status(400).json({ message: "Compte administrateur introuvable" });
  }

  const isCurrentValid = verifyPassword(cleanCurrent, admin.password_hash);
  if (!isCurrentValid) {
    return res.status(400).json({ message: "Le mot de passe actuel est incorrect" });
  }

  const newHash = hashPassword(cleanNew);
  const newToken = `admin-${crypto.randomBytes(16).toString("hex")}`;

  updateAdminPassword(admin.id, newHash, newToken);

  res.json({
    ok: true,
    message: "Mot de passe mis à jour avec succès dans la base de données",
    token: newToken,
    username: admin.username
  });
});

app.post("/api/orders", (req, res) => {
  const { customerName, customerPhone, customerCity, customerAddress, items } = req.body || {};
  if (!customerName || !customerPhone || !customerCity || !customerAddress || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const findProduct = db.prepare("SELECT * FROM products WHERE id = ?");
  const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_name, customer_phone, customer_city, customer_address, items_json, total_dh, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `);

  try {
    db.exec("BEGIN;");

    let total = 0;
    const normalizedItems = items.map((it) => {
      const qty = Number(it.qty || 1);
      const product = findProduct.get(Number(it.productId));
      if (!product) throw new Error(`Product not found: ${it.productId}`);
      if (qty <= 0) throw new Error("Invalid quantity");
      if (product.stock < qty) throw new Error(`Stock insuffisant: ${product.title}`);
      total += product.price_dh * qty;
      updateStock.run(qty, product.id);
      return {
        productId: product.id,
        title: product.title,
        qty,
        unitPriceDh: product.price_dh,
        lineTotalDh: product.price_dh * qty
      };
    });

    const info = insertOrder.run(
      customerName,
      customerPhone,
      customerCity,
      customerAddress,
      JSON.stringify(normalizedItems),
      total
    );

    db.exec("COMMIT;");
    const result = { orderId: Number(info.lastInsertRowid), total, items: normalizedItems };

    const message = [
      "*NOUVELLE COMMANDE - PrüfungStore*",
      "",
      `Client: ${customerName}`,
      `Téléphone: ${customerPhone}`,
      `Ville: ${customerCity}`,
      `Adresse: ${customerAddress}`,
      "",
      "Articles:",
      ...result.items.map((i) => `• ${i.title} x${i.qty} = ${i.lineTotalDh} DH`),
      "",
      `Total: ${result.total} DH`
    ].join("\n");

    const whatsappUrl = toWhatsAppUrl(config.whatsappNumber, message);
    res.status(201).json({
      id: result.orderId,
      totalDh: result.total,
      items: result.items,
      whatsappUrl
    });
  } catch (error) {
    try { db.exec("ROLLBACK;"); } catch {}
    res.status(400).json({ message: error.message || "Could not create order" });
  }
});

app.get("/api/admin/products", requireAdmin, (_req, res) => {
  const rows = db.prepare("SELECT * FROM products ORDER BY id DESC").all();
  res.json(rows.map(mapProduct));
});

app.post("/api/admin/upload-images", requireAdmin, upload.array("images", 6), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: "Select at least one image" });
  res.status(201).json({
    imageUrls: req.files.map((file) => `/api/uploads/${file.filename}`)
  });
});

app.post("/api/admin/upload-image", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  res.status(201).json({ imageUrl: `/api/uploads/${req.file.filename}`, fileName: req.file.filename });
});

app.post("/api/admin/products", requireAdmin, (req, res) => {
  const { title, level, examType, priceDh, stock, imageUrl = "", imageUrls = [], description = "" } = req.body || {};
  const gallery = Array.isArray(imageUrls) && imageUrls.length ? imageUrls : imageUrl ? [imageUrl] : [];
  if (!title || !level || !examType || !gallery.length || Number(priceDh) <= 0 || Number(stock) < 0) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const info = db.prepare(`
    INSERT INTO products (title, level, exam_type, price_dh, stock, image_url, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, level, examType, Number(priceDh), Number(stock), imageUrl, description);

  const productId = info.lastInsertRowid;
  const saveImage = db.prepare("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)");
  gallery.forEach((url, index) => saveImage.run(productId, String(url), index));
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);
  res.status(201).json(mapProduct(row));
});

app.put("/api/admin/products/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { title, level, examType, priceDh, stock, imageUrl = "", imageUrls = [], description = "" } = req.body || {};
  const gallery = Array.isArray(imageUrls) && imageUrls.length ? imageUrls : imageUrl ? [imageUrl] : [];
  if (!id || !title || !level || !examType || !gallery.length || Number(priceDh) <= 0 || Number(stock) < 0) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  db.prepare(`
    UPDATE products
    SET title = ?, level = ?, exam_type = ?, price_dh = ?, stock = ?, image_url = ?, description = ?
    WHERE id = ?
  `).run(title, level, examType, Number(priceDh), Number(stock), imageUrl, description, id);

  db.prepare("DELETE FROM product_images WHERE product_id = ?").run(id);
  const saveImage = db.prepare("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)");
  gallery.forEach((url, index) => saveImage.run(id, String(url), index));
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ message: "Product not found" });
  res.json(mapProduct(row));
});

app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare("DELETE FROM products WHERE id = ?").run(id);
  if (info.changes === 0) return res.status(404).json({ message: "Product not found" });
  res.status(204).send();
});

app.get("/api/admin/orders", requireAdmin, (_req, res) => {
  const rows = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();
  res.json(
    rows.map((r) => ({
      id: r.id,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      customerCity: r.customer_city,
      customerAddress: r.customer_address,
      items: JSON.parse(r.items_json),
      totalDh: r.total_dh,
      status: r.status,
      createdAt: r.created_at
    }))
  );
});

app.patch("/api/admin/orders/:id/status", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const allowedStatuses = ["pending", "confirmed", "shipped", "cancelled"];
  const status = String(req.body?.status || "");
  if (!id || !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  const info = db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  if (info.changes === 0) return res.status(404).json({ message: "Order not found" });
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  res.json({ id: row.id, status: row.status });
});

app.delete("/api/admin/orders/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare("DELETE FROM orders WHERE id = ?").run(id);
  if (info.changes === 0) return res.status(404).json({ message: "Order not found" });
  res.status(204).send();
});

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
});
