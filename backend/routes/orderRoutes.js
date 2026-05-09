const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// PLACE ORDER
router.post("/place", async (req, res) => {
  try {
    const {
      customerId,
      items,
      address,
      paymentMethod,
      totalPrice,
      deliveryCharge,
      finalTotal
    } = req.body;

    const order = new Order({
      customerId,
      items,
      address,
      paymentMethod,
      totalPrice,
      deliveryCharge,
      finalTotal
    });

    await order.save();

    res.json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE STATUS
router.put("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CANCEL ORDER
router.delete("/cancel/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order.status !== "pending") {
      return res.json({ message: "Cannot cancel after confirmation" });
    }

    await order.deleteOne();

    res.json({ message: "Order cancelled" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL ORDERS (ADMIN)
router.get("/", async (req, res) => {
  const orders = await Order.find()
    .populate("customerId", "name")
    .populate("items.productId", "name");

  res.json(orders);
});

// GET USER ORDERS
router.get("/user/:id", async (req, res) => {
  const orders = await Order.find({ customerId: req.params.id });
  res.json(orders);
});

module.exports = router;