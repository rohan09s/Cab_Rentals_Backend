// import express from "express";
// import crypto from "crypto";
// import { razorpay } from "../utils/razorpay.js";
// import Booking from "../models/Booking.js";


// dotenv.config(); // ✅ ADD THIS HERE
// const router = express.Router();


// // ✅ CREATE ORDER
// router.post("/create-order", async (req, res) => {
//   try {
//     const { amount } = req.body;

//     const order = await razorpay.orders.create({
//       amount: amount * 100,
//       currency: "INR",
//       receipt: "receipt_1"
//     });

//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // ✅ VERIFY + SAVE BOOKING
// router.post("/verify", async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       bookingData
//     } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ success: false });
//     }

//     const booking = await Booking.create({
//       ...bookingData,
//       paymentId: razorpay_payment_id,
//       orderId: razorpay_order_id,
//       status: "confirmed"
//     });

//     // ✅ WhatsApp link
//     const message = `
// 🚗 Booking Confirmed

// Name: ${booking.name}
// Phone: ${booking.phone}
// Trip: ${booking.fromCity} → ${booking.toCity}
// Date: ${booking.date}
// Time: ${booking.time}
// Car: ${booking.car}
// Fare: ₹${booking.fare}
//     `;

//     const whatsappLink =
//       "https://wa.me/917709040404?text=" +
//       encodeURIComponent(message);

//     res.json({
//       success: true,
//       booking,
//       whatsappLink
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;



// import express from "express";
// import crypto from "crypto";
// import { razorpay } from "../utils/razorpay.js";

// const router = express.Router();

// // create order
// router.post("/create-order", async (req, res) => {
//   try {
//     const { amount } = req.body;

//     const options = {
//       amount: amount * 100, // ₹ to paise
//       currency: "INR",
//       receipt: "receipt_" + Date.now(),
//     };

//     const order = await razorpay.orders.create(options);
//     res.json(order);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error creating order");
//   }
// });

// // verify payment
// router.post("/verify", (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//       req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature === razorpay_signature) {
//       res.json({ success: true, message: "Payment verified" });
//     } else {
//       res.status(400).json({ success: false, message: "Invalid signature" });
//     }
//   } catch (error) {
//     res.status(500).send("Verification failed");
//   }
// });

// export default router;


import express from "express";
import crypto from "crypto";
import { razorpay } from "../utils/razorpay.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// ✅ CREATE ORDER
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    console.log("📝 Incoming request - Amount:", amount);

    if (!amount) {
      console.error("❌ No amount provided");
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount: amount * 100, // ₹ to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    console.log("📤 Creating Razorpay order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("✅ Order created successfully:", order);
    res.json(order);

  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error.message, error);
    res.status(500).json({ error: error.message || "Error creating order" });
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