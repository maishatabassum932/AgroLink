const express = require("express");
const router = express.Router();
const Product = require("../models/Product");


// ADD PRODUCT
router.post("/add", async (req, res) => {
  try {
    const {
      name,        // { en, bn }
      category,    // { en, bn }
      price,
      unit,
      quantity,
      image,
      farmerId,
      district,
      area,
      harvestDate
    } = req.body;

    const product = new Product({
      name,
      category,
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
    res.json({ message: "Product added successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const { category, area } = req.query;

    let filter = {};
    if (category) filter["category.en"] = category;
    if (area) filter.area = area;

const products = await Product.find({
  ...filter,
  isApproved: true
}).populate("farmerId", "name area");
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

// GET FARMER PRODUCTS
router.get("/farmer/:id", async (req, res) => {

  try {

    const products = await Product.find({
      farmerId: req.params.id
    });

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
        isApproved: true
      },
      { new: true }
    );

    res.json(approvedProduct);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});
// delete product 
router.delete("/delete/:id", async (req, res) => {

  try {

    const deletedProduct = await Product.findByIdAndDelete(
      req.params.id
    );

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deleted successfully"
    });

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

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
