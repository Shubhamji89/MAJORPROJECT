const express = require("express");
const router = express.Router( { mergeParams: true } );
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewOwner } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
const Review = require("../models/review.js");


//Reviews
//Post route
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
  );
  
  //Delete route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewOwner,
    wrapAsync(reviewController.destroyReview)
  );

module.exports = router;