import express from "express";
import Booking from "../models/Booking.js";
import jwt from "jsonwebtoken";
import { sendCustomerEmail, sendOwnerEmail } from "../utils/email.js";

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

// Create a manual enquiry (admin only)
router.post("/manual-create", async (req, res) => {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, phone, fromCity, toCity, date, time, car, fare, amountPaid, status } = req.body;

    // Validation
    if (!name || !phone || !fromCity || !toCity || !date || !time || !car || !fare) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create booking
    const booking = await Booking.create({
      name,
      phone,
      fromCity,
      toCity,
      date,
      time,
      car,
      fare: Number(fare),
      amountPaid: amountPaid ? Number(amountPaid) : 0,
      status: status || "confirmed"
    });

    console.log("✅ Manual booking created:", booking);

    // Send emails to customer and owner
    console.log("📧 Sending confirmation emails...");
    await sendCustomerEmail(booking);
    await sendOwnerEmail(booking);

    res.status(201).json({
      success: true,
      message: "Enquiry created successfully",
      booking
    });
  } catch (error) {
    console.error("❌ Error creating manual enquiry:", error);
    res.status(500).json({ message: "Failed to create enquiry" });
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