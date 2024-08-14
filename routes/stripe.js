require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const Booking = require("../models/booking"); // Your Mongoose model
const router = express.Router();

router.post("/create-payment-intent", express.json(), async (req, res) => {
  const { user_id, hotel_id, amount, price, details, name,checkInDate,
    checkInTime,
    checkOutDate,
    checkOutTime } = req.body;
  const totalPrice = amount * price;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Convert to cents
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        user_id,
        hotel_id,
        price,
        amount,
        totalPrice,
        details,
        checkInDate,
        checkInTime,
        checkOutDate,
        checkOutTime
      },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).send({ error: error.message });
  }
});


router.post("/confirm-payment", express.json(), async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const { metadata } = paymentIntent;

      const invoice = paymentIntent.charges?.data?.[0]?.receipt_url || "NO_INVOICE";

      await Booking.create({
        user_id: metadata.user_id,
        hotel_id: metadata.hotel_id,
        amount: metadata.amount,
        price: metadata.price,
        totalPrice: metadata.totalPrice,
        details: metadata.details,
        checkInDate: metadata.checkInDate,
        checkInTime: metadata.checkInTime,
        checkOutDate: metadata.checkOutDate,
        checkOutTime: metadata.checkOutTime,
        payment_status: "succeeded",
        invoice: invoice,
        payment_intent: paymentIntent.id,
      });

      res.status(200).send({ success: true });
    } else {
      res.status(400).send({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).send({ success: false, message: error.message });
  }
});


module.exports = router;




