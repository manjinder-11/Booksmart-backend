const express = require("express");
const router = express.Router();
const { createPaymentIntent, confirmPayment } = require("../controllers/bookingController");

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { bookingId } = req.body;
    const result = await createPaymentIntent(bookingId);
    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/confirm-payment", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const booking = await confirmPayment(paymentIntentId);
    res.send(booking);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
