const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/booking");
const User = require("../models/User");
exports.createPaymentIntent = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate("user");
  const amount = booking.amount * 100; // Stripe works with the smallest currency unit (cents for USD)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    customer: booking.user.stripeCustomerId,
    metadata: { bookingId: booking._id.toString() },
  });

  booking.stripePaymentIntentId = paymentIntent.id;
  await booking.save();

  return { clientSecret: paymentIntent.client_secret };
};

exports.confirmPayment = async (paymentIntentId) => {
  const booking = await Booking.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntentId },
    { paymentStatus: "paid" },
    { new: true }
  );
  if (!booking) {
    throw new Error("Booking not found");
  }
  return booking;
};
