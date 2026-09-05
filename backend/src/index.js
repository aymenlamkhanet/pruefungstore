import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { config } from "./config.js";
import { db } from "./db.js";
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
  return {
    id: row.id,
    title: row.title,
    level: row.level,
    examType: row.exam_type,
    priceDh: row.price_dh,
    stock: row.stock,
    imageUrl: row.image_url,
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
  const okUser = String(username || "").trim().toLowerCase() === config.adminUsername.toLowerCase();
  const okPass = String(password || "") === config.adminPassword;

  if (!okUser || !okPass) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  res.json({
    token: config.adminToken,
    username: config.adminUsername
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

app.post("/api/admin/upload-image", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  res.status(201).json({
    imageUrl: `/api/uploads/${req.file.filename}`,
    fileName: req.file.filename
  });
});

app.post("/api/admin/products", requireAdmin, (req, res) => {
  const { title, level, examType, priceDh, stock, imageUrl = "", description = "" } = req.body || {};
  if (!title || !level || !examType || !imageUrl || Number(priceDh) <= 0 || Number(stock) < 0) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const info = db.prepare(`
    INSERT INTO products (title, level, exam_type, price_dh, stock, image_url, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, level, examType, Number(priceDh), Number(stock), imageUrl, description);

  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(mapProduct(row));
});

app.put("/api/admin/products/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { title, level, examType, priceDh, stock, imageUrl = "", description = "" } = req.body || {};
  if (!id || !title || !level || !examType || !imageUrl || Number(priceDh) <= 0 || Number(stock) < 0) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  db.prepare(`
    UPDATE products
    SET title = ?, level = ?, exam_type = ?, price_dh = ?, stock = ?, image_url = ?, description = ?
    WHERE id = ?
  `).run(title, level, examType, Number(priceDh), Number(stock), imageUrl, description, id);

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

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
});
