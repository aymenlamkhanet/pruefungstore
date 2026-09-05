import { config } from "./config.js";

export function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!token || token !== config.adminToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
