const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  contactInfo: {
    phoneNumber: { type: String, required: true },
    emailAddress: { type: String, required: true },
  },
  pricing: {
    minPricePerNight: { type: Number, required: true },
    maxPricePerNight: { type: Number, required: true },
  },
  roomTypes: { type: [String], required: true },
  amenities: { type: [String], required: true },
  availability: {
    numberOfRoomsAvailable: { type: Number, required: true },
    bookingCalendar: { type: String, required: true },
  },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Hotel", HotelSchema);
