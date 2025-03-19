const express = require("express");
const router = express.Router( { mergeParams: true } );
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewOwner } = require("../middleware.js");


//Reviews
//Post route
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(async (req, res) => {
      let listing = await Listing.findById(req.params.id);
      let newReview = new Review(req.body.review);
      // Set review author to current user
      newReview.author = req.user._id;
      listing.reviews.push(newReview);
      await newReview.save();
      await listing.save();
      req.flash("success", "New review created Successfully!");
      res.redirect(`/listings/${listing._id}`);
    })
  );
  
  //Delete route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewOwner,
    wrapAsync(async (req, res) => {
      let { id, reviewId } = req.params;
      await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
      await Review.findByIdAndDelete(reviewId);
      req.flash("success", "Review deleted Successfully!");
      res.redirect(`/listings/${id}`);
    })
  );

module.exports = router;