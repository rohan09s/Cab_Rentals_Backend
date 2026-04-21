// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";

// import bookingRoutes from "./routes/bookingRoutes.js";
// import paymentRoutes from "./routes/payment.js";

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.get("/", (req, res) => {
//   res.send("API Running 🚀");
// });

// app.use("/api/bookings", bookingRoutes);
// app.use("/api/payment", paymentRoutes);

// // DB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connected ✅"))
//   .catch(err => console.log("DB Error:", err));

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: "Something went wrong" });
// });

// // Server
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT} 🚀`);
// });




// import dotenv from "dotenv";
// dotenv.config(); // ✅ VERY IMPORTANT (top of file)

// import express from "express";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import paymentRoutes from "./routes/payment.js";

// const app = express();

// // middleware
// app.use(cors());
// app.use(express.json());

// // connect DB
// connectDB();

// // routes
// app.use("/api/payment", paymentRoutes);

// // test route
// app.get("/", (req, res) => {
//   res.send("API running...");
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });




import dotenv from "dotenv";
dotenv.config(); // ✅ MUST be at top

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import paymentRoutes from "./routes/payment.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminroutes.js";

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ DB connection
connectDB();

// ✅ Routes
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// 👉 Payment
app.use("/api/payment", paymentRoutes);

// 👉 Bookings (admin protected)
app.use("/api/bookings", bookingRoutes);

// 👉 Admin login
app.use("/api/admin", adminRoutes);

// ✅ Error handler (important)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

// ✅ Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
