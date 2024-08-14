const mongoose = require("mongoose");
const hotel = require("./hotel");
const ReviewSchema = new mongoose.Schema(
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
    comment: {
      type: String,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
    },
  },
  { timestamps: true }
);

ReviewSchema.post("save", async function () {
  await updateHotelRating(this.hotel_id);
});

ReviewSchema.post("findOneAndUpdate", async function (doc) {
  await updateHotelRating(doc.hotel_id);
});

ReviewSchema.post("remove", async function (doc) {
  await updateHotelRating(doc.hotel_id);
});

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;

async function updateHotelRating(hotelId) {
  try {
    const result = await Review.aggregate([
      { $match: { hotel_id: hotelId } },
      {
        $group: {
          _id: "$hotel_id",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const rating = result[0];

    if (rating) {
      await hotel.findByIdAndUpdate(
        hotelId,
        {
          averageRating: rating.averageRating,
          totalReviews: rating.totalReviews,
        },
        { new: true, useFindAndModify: false }
      );
    } else {
      await Hotel.findByIdAndUpdate(
        hotelId,
        {
          averageRating: 0,
          totalReviews: 0,
        },
        { new: true, useFindAndModify: false }
      );
    }
  } catch (error) {
    console.error("Error updating hotel rating:", error);
  }
}
