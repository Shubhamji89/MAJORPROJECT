const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingsController = require("../controllers/listings.js");

//Index route
router.get("/", wrapAsync(listingsController.index));

// new route
router.get("/new", isLoggedIn, listingsController.renderNewForm);

//Show route
router.get("/:id", wrapAsync(listingsController.showListing));

//Create route
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(listingsController.createListing)
);

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsController.renderEditForm)
);

//update route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingsController.updateListing)
);

// delete route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsController.destroyListing)
);

module.exports = router;
