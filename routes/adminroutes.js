import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

const getAdminConfig = () => {
  const adminEmail = process.env.ADMIN_EMAIL || "amittravelspune@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AmitTravels@2026";
  const jwtSecret = process.env.ADMIN_JWT_SECRET || "amit_travels_admin_jwt_2026";

  return {
    email: adminEmail,
    passwordHash: bcrypt.hashSync(adminPassword, 10),
    jwtSecret,
  };
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const ADMIN = getAdminConfig();

  if (email !== ADMIN.email) {
    return res.status(400).json({ message: "Invalid email" });
  }

  const isMatch = await bcrypt.compare(password, ADMIN.passwordHash);

  if (!isMatch) {
    return res.status(400).json({ message: "Wrong password" });
  }

  const token = jwt.sign({ email }, ADMIN.jwtSecret, {
    expiresIn: "1d",
  });

  res.json({ token });
});

export default router;