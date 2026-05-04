import express from "express";
import Booking from "../models/Booking.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || "amit_travels_admin_jwt_2026";

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
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// Delete a booking by id (admin only)
router.delete("/:id", async (req, res) => {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { id } = req.params;
    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json({ success: true, booking: deletedBooking });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete booking" });
  }
});

export default router;