import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

const ADMIN = {
  email: "admin@gmail.com",
  password: bcrypt.hashSync("123456", 10),
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN.email) {
    return res.status(400).json({ message: "Invalid email" });
  }

  const isMatch = await bcrypt.compare(password, ADMIN.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Wrong password" });
  }

  const token = jwt.sign({ email }, "secret123", {
    expiresIn: "1d",
  });

  res.json({ token });
});

export default router;