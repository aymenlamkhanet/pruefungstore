import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { config } from "./config.js";

const dir = path.dirname(config.dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export const db = new DatabaseSync(config.dbPath);
db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    level TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    price_dh INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_city TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    items_json TEXT NOT NULL,
    total_dh INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const existing = db.prepare("SELECT COUNT(*) as count FROM products").get();
if (existing.count === 0) {
  const seed = db.prepare(`
    INSERT INTO products (title, level, exam_type, price_dh, stock, image_url, description)
    VALUES (@title, @level, @exam_type, @price_dh, @stock, @image_url, @description)
  `);

  const products = [
    {
      title: "Pack B1 TELC-Prüfung Deutsch",
      level: "B1",
      exam_type: "telc",
      price_dh: 235,
      stock: 12,
      image_url: "assets/products/pack-b1.png",
      description: "Pack officiel B1 TELC avec supports écrits et oraux."
    },
    {
      title: "Pack GOETHE - ÖSD B1 & B2",
      level: "B1 & B2",
      exam_type: "goethe",
      price_dh: 235,
      stock: 9,
      image_url: "assets/products/goethe-osd-b1-b2.jpg",
      description: "25 Modelltests avec solutions et QR audio."
    },
    {
      title: "Pack B2 TELC-Prüfung Deutsch",
      level: "B2",
      exam_type: "telc",
      price_dh: 260,
      stock: 8,
      image_url: "assets/products/telc-real-collection.jpg",
      description: "Collection complète B2: Lesen, Hören, Schreiben, Sprachbausteine."
    }
  ];

  db.exec("BEGIN;");
  try {
    for (const p of products) {
      seed.run(p);
    }
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}
