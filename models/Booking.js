import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  fromCity: String,
  toCity: String,
  date: String,
  time: String,
  car: String,
  fare: Number,
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentId: String,
  orderId: String,
  status: {
    type: String,
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);