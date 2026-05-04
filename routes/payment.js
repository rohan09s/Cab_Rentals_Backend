import express from "express";
import crypto from "crypto";
import { razorpay } from "../utils/razorpay.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// Shared key response used by both /config and /key for compatibility
const sendRazorpayKey = (res) => {
  const key = process.env.RAZORPAY_KEY_ID;

  if (!key) {
    return res.status(500).json({
      success: false,
      message: "RAZORPAY_KEY_ID is not configured on server",
    });
  }

  return res.json({ success: true, key });
};

// ✅ FRONTEND CONFIG: return backend Razorpay key to avoid mode mismatch
router.get("/config", (req, res) => sendRazorpayKey(res));

// Backward-compatible alias in case frontend points to /key
router.get("/key", (req, res) => sendRazorpayKey(res));

// ✅ CREATE ORDER
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    console.log("📝 Incoming request - Amount:", amount);

    if (!amount) {
      console.error("❌ No amount provided");
      return res.status(400).json({ error: "Amount is required" });
    }

    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amountNumber * 100), // ₹ to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    console.log("📤 Creating Razorpay order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("✅ Order created successfully:", order);
    res.json(order);

  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error.message, error);
    const razorpayDescription = error?.error?.description || error?.description;
    const razorpayCode = error?.error?.code || error?.code;

    res.status(500).json({
      error: razorpayDescription || error.message || "Error creating order",
      code: razorpayCode || "CREATE_ORDER_FAILED",
    });
  }
});

// ✅ VERIFY PAYMENT + SAVE BOOKING + WHATSAPP
router.post("/verify", async (req, res) => {
  try {
    console.log("🔵 Verify endpoint called");
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData
    } = req.body;

    console.log("📦 Received data:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature?.substring(0, 10) + "...",
      bookingData
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("❌ Missing payment details");
      return res.status(400).json({
        success: false,
        message: "Missing payment details"
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("🔐 Verifying signature for body:", body);

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("❌ RAZORPAY_KEY_SECRET not configured");
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    console.log("✔️ Expected signature:", expectedSignature.substring(0, 10) + "...");
    console.log("✔️ Received signature:", razorpay_signature.substring(0, 10) + "...");

    // ❌ Invalid payment
    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Signature mismatch!");
      return res.status(400).json({
        success: false,
        message: "Invalid signature - payment verification failed"
      });
    }

    console.log("✅ Signature verified!");

    // ✅ SAVE BOOKING IN DATABASE
    console.log("💾 Saving booking to database...");
    const booking = await Booking.create({
      ...bookingData,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "confirmed"
    });

    console.log("✅ Booking saved:", booking);

    // ✅ WHATSAPP MESSAGE
    const message = `
🚗 Booking Confirmed

Name: ${booking.name}
Phone: ${booking.phone}
Trip: ${booking.fromCity} → ${booking.toCity}
Date: ${booking.date}
Time: ${booking.time}
Car: ${booking.car}
Fare: ₹${booking.fare}
    `;

    const whatsappLink =
      "https://wa.me/917709040404?text=" +
      encodeURIComponent(message);

    // ✅ FINAL RESPONSE
    console.log("✅ Returning success response");
    res.json({
      success: true,
      booking,
      whatsappLink
    });

  } catch (error) {
    console.error("❌ VERIFY ERROR:", error.message, error.stack);
    res.status(500).json({ 
      success: false,
      error: error.message || "Verification failed" 
    });
  }
});

export default router;