import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "admin2026",
  adminToken: process.env.ADMIN_TOKEN || "admin-2026",
  whatsappNumber: process.env.WHATSAPP_NUMBER || "212639985296",
  dbPath: process.env.DB_PATH || "./data/pruefungstore.db",
  uploadsDir: process.env.UPLOADS_DIR || "./data/uploads",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000"
};
