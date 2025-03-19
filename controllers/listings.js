const Listing = require("../models/listing");

const index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

const renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

const showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Cannot find that listing!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

const createListing = async (req, res, next) => {
  let newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New listing created Successfully!");
  res.redirect("/listings");
};

const renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
};

const updateListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing updated Successfully!");
  res.redirect(`/listings/${id}`);
};

const destroyListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.find;

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted Successfully!");
  res.redirect("/listings");
};

module.exports = {
  index,
  renderNewForm,
  showListing,
  createListing,
  renderEditForm,
  updateListing,
  destroyListing,
};  
