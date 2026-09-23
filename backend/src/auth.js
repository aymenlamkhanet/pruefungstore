import { config } from "./config.js";
import { getAdminByToken, getAdminByUsername } from "./db.js";

export function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const adminInDb = getAdminByToken(token);
  if (adminInDb) {
    req.adminUser = adminInDb;
    return next();
  }

  if (token === config.adminToken) {
    req.adminUser = getAdminByUsername(config.adminUsername) || { id: 1, username: config.adminUsername };
    return next();
  }

  return res.status(401).json({ message: "Unauthorized" });
}
