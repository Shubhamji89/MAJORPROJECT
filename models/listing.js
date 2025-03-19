const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  imageUrl: {
      type: String,
      required: false,
      default:
        "https://media.istockphoto.com/id/1126610893/photo/paradise-sandy-beach-with-coco-palm.jpg?s=2048x2048&w=is&k=20&c=sZwpnfB1ybwfQbIXf_jauNJXVWoQoZMUcWMFkjS1iiA=",
      set: (v) =>
        v === ""
          ? "https://media.istockphoto.com/id/1126610893/photo/paradise-sandy-beach-with-coco-palm.jpg?s=2048x2048&w=is&k=20&c=sZwpnfB1ybwfQbIXf_jauNJXVWoQoZMUcWMFkjS1iiA="
          : v,
    },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({
      _id: {
        $in: listing.reviews,
      },
    });
  }
}
);

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
