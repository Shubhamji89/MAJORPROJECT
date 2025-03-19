const Listing = require("../models/listing");
const Review = require("../models/review");

const createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  // Set review author to current user
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "New review created Successfully!");
  res.redirect(`/listings/${listing._id}`);
};

const destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted Successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports = {
  createReview,
  destroyReview,
};