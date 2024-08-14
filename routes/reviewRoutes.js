const express = require("express");

const router = express.Router();
const {
  CreateReview,
  GetReview,
  GetReviews,
} = require("../controllers/reviewController");

router.get("/", GetReviews);
router.post("/", CreateReview);
router.get("/:id", GetReview);

module.exports = router;
