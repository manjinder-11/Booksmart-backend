const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel ID is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
    },
    details: {
      type: String,
      // required: [true, "Details is required"],
    },
    checkInDate: {
      type: Date,
      required: [true, "Check-In Date is required"],
    },
    checkInTime: {
      type: String,
      required: [true, "Check-In Time is required"],
    },
    checkOutDate: {
      type: Date,
      required: [true, "Check-Out Date is required"],
    },
    checkOutTime: {
      type: String,
      required: [true, "Check-Out Time is required"],
    },
    payment_status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },
    invoice: {
      type: String,
      // required: true,
    },
    payment_intent: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;
