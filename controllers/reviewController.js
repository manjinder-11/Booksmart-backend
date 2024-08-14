const Review = require("../models/review");

exports.CreateReview = async (req, res) => {
  try {
    const { user_id, hotel_id, rating, comment } = req.body;
    await Review.create({
      user_id,
      hotel_id,
      rating,
      comment,
    });
    res.status(201).json({ message: "Review created" });
  } catch (error) {
    console.log(error);
  }
};
exports.GetReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user_id", "name");
    res.json(reviews);
  } catch (error) {
    console.log(error);
  }
};
exports.GetReview = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ hotel_id: id }).populate(
      "user_id",
      "name"
    );
    res.json(reviews);
  } catch (error) {
    console.log(error);
  }
};
exports.GetSpecificReviewForSpecificUser = async (req, res) => {
  try {
    const { user_id, hotel_id } = req.params;
    const review = await Review.findOne({ user_id, hotel_id });
    res.json(review);
  } catch (error) {
    console.log(error);
  }
};
