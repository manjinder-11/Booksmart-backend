const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");

router.get("/get", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user_id", "name email")
      .populate("hotel_id", "name");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
