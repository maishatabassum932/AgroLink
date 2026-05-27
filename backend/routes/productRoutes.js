const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, "uploads/");

  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() +
      path.extname(file.originalname);

    cb(null, uniqueName);

  }

});

const upload = multer({
  storage
});


// ADD PRODUCT
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const {
  name,
  category,
  price,
  unit,
  quantity,
  farmerId,
  district,
  area,
  harvestDate
} = req.body;

const image =
  req.file
    ? `http://localhost:3000/uploads/${req.file.filename}`
    : "";

    const product = new Product({

  name: JSON.parse(name),

  category: JSON.parse(category),

  price,
  unit,
  quantity,

  image,

  farmerId,

  district,
  area,

  harvestDate

});

    await product.save();
    
    // Emit real-time update
    global.io?.emit("product:added", product);
    
    res.json({ message: "Product added successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const { category, area } = req.query;

    let filter = { isDeleted: { $ne: true } };
    if (category) filter["category.en"] = category;
    if (area) filter.area = area;

const products = await Product.find(filter)
.populate("farmerId", "name area");

    const today = new Date();

    const updatedProducts = products.map(p => {
      let freshness = "Old";

      if (p.harvestDate) {
        const diffDays = Math.floor(
          (today - new Date(p.harvestDate)) / (1000 * 60 * 60 * 24)
        );

        if (diffDays <= 2) freshness = "Fresh";
        else if (diffDays <= 5) freshness = "Moderate";
      }

      return {
        ...p._doc,
        freshness
      };
    });

    res.json(updatedProducts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET APPROVED PRODUCTS ONLY
router.get("/approved/all", async (req, res) => {

  try {

    const products = await Product.find({
      isApproved: true,
      isDeleted: { $ne: true }
    }).populate("farmerId", "name area");

    res.json(products);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// GET FARMER PRODUCTS
router.get("/farmer/:id", async (req, res) => {

  try {

    const products = await Product.find({
      farmerId: req.params.id
    }).sort({ updatedAt: -1 });

    res.json(products);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});
// GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("farmerId", "name area district");

    res.json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// APPROVE PRODUCT
router.put("/approve/:id", async (req, res) => {

  try {

    const approvedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
         isApproved: true,
        approvedAt: new Date(),
        approvalMessage: "Admin approved this product"
      },
      { new: true }
    );

    // Emit real-time update
    global.io?.emit("product:approved", approvedProduct);

    res.json(approvedProduct);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});
// SOFT DELETE PRODUCT
router.put("/delete/:id", async (req, res) => {

  try {

    const deletedProduct =
      await Product.findByIdAndUpdate(

        req.params.id,

        {
          isDeleted: true,
          deletedAt: new Date(),
          deletionMessage: "Admin deleted this product"
        },

        { new: true }

      );

    // Emit real-time update
    global.io?.emit("product:deleted", deletedProduct);

    res.json(deletedProduct);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});
//update product
router.put("/update/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // returns updated data
    );

    // Emit real-time update
    global.io?.emit("product:updated", updatedProduct);

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
