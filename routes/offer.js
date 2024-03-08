const express = require("express");
const router = express.Router();

const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const Offer = require("../models/Offer");
const convertToBase64 = require("../utils/convertToBase64");
const isAuthenticated = require("../utils/isAuthenticated");

router.get("/offers", isAuthenticated, async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;
    const querysFind = {};
    const sortFunc = {};
    let skip = 0;
    if (page) {
      skip = (page - 1) * 10;
    }
    if (title) {
      querysFind.product_name = new RegExp(title, "i");
    }
    if (priceMin && priceMax) {
      querysFind.product_price = {
        $gte: priceMin,
        $lte: priceMax,
      };
    } else if (priceMin) {
      querysFind.product_price = { $lte: priceMin };
    } else if (priceMax) {
      querysFind.product_price = { $lte: priceMax };
    }
    if (sort === "prise-asc") {
      sortFunc.product_price = "asc";
    } else if (sort === "prise-asc") {
      sortFunc.product_price = "desc";
    }
    const offers = await Offer.find(querysFind).populate("owner", "account").sort(sortFunc).skip(skip).limit(10);
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    const article = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    if (!article) {
      return res.status(400).json({ message: "no id" });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      const convertedFile = convertToBase64(req.files.picture);
      const uploadResult = await cloudinary.uploader.upload(convertedFile);
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { SIZE: size },
          { ETAT: condition },
          { COLOR: color },
          { CITY: city },
        ],
        product_image: uploadResult,
        owner: req.owner,
      });
      await newOffer.save();
      res.json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
