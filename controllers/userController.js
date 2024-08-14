const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Booking = require("../models/booking");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get user profile by email
router.get("/", async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });

    if (user) {
      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        country: user.country,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put("/", async (req, res) => {
  const { email, firstName, lastName, phoneNumber, address, country } =
    req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.address = address || user.address;
      user.country = country || user.country;

      const updatedUser = await user.save();
      res.json({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        country: updatedUser.country,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ************
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let bookings = await Booking.find({ user_id: id })
      .populate("hotel_id", "name")
      .populate("user_id", "name");

    // Check for missing invoices and fetch from Stripe
    for (let booking of bookings) {
      if (!booking.invoice) {
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.payment_intent);
        if (paymentIntent.charges.data.length > 0) {
          const charge = paymentIntent.charges.data[0];
          if (charge.invoice) {
            booking.invoice = charge.invoice;
            await booking.save(); // Save the updated booking with the invoice
          }
        }
      }
    }

    res.json({ bookings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
