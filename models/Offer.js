const mongoose = require("mongoose");

const { Schema } = mongoose;

const OfferSchema = new Schema({
  product_name: String,
  product_description: String,
  product_price: Number,
  product_details: Array,
  product_image: Object,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Offer = mongoose.model("Offer", OfferSchema);

module.exports = Offer;
