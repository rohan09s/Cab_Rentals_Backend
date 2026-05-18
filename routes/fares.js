import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const dataFile = path.join(__dirname, "..", "data", "oneWayRates.json");
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "amit_travels_admin_jwt_2026";

const readRates = async () => {
  const content = await fs.promises.readFile(dataFile, "utf8");
  return JSON.parse(content);
};

const writeRates = async (rates) => {
  await fs.promises.writeFile(dataFile, JSON.stringify(rates, null, 2), "utf8");
};

const getAdminFromRequest = (req) => {
  const token = req.headers.authorization;
  if (!token) return null;

  try {
    return jwt.verify(token, ADMIN_JWT_SECRET);
  } catch {
    return null;
  }
};

router.get("/", async (req, res) => {
  try {
    const rates = await readRates();
    res.json(rates);
  } catch (error) {
    console.error("Failed to read fare rates:", error);
    res.status(500).json({ message: "Failed to load fare rates" });
  }
});

router.put("/:routeKey", async (req, res) => {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const routeKey = decodeURIComponent(req.params.routeKey);
  const { fare, type } = req.body;

  if (!routeKey || !type) {
    return res.status(400).json({ message: "Route key and vehicle type are required" });
  }

  if (!fare || Number.isNaN(Number(fare))) {
    return res.status(400).json({ message: "Valid fare is required" });
  }

  try {
    const rates = await readRates();
    if (!rates[routeKey] || !Object.prototype.hasOwnProperty.call(rates[routeKey], type)) {
      return res.status(404).json({ message: "Route or vehicle type not found" });
    }

    rates[routeKey][type] = Number(fare);
    await writeRates(rates);

    res.json({ success: true, routeKey, type, fare: Number(fare) });
  } catch (error) {
    console.error("Failed to update fare rate:", error);
    res.status(500).json({ message: "Failed to update fare" });
  }
});

export default router;
