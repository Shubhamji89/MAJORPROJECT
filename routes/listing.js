const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingsController = require("../controllers/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
]);

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("Only JPG, JPEG, PNG, and WEBP images up to 10MB are allowed."));
  },
});



router
  .route("/")
  .get(listingsController.index)
  .post(
    isLoggedIn,
    upload.single('listing[image]'), // Ensure multer handles file uploads
    validateListing,
    wrapAsync(listingsController.createListing)
  );
    
      
// new route
router.get("/new", isLoggedIn, listingsController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingsController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'), // Ensure multer handles file uploads
    validateListing,
    wrapAsync(listingsController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingsController.destroyListing));

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsController.renderEditForm)
);


module.exports = router;