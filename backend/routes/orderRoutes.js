const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");

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

    // STEP 1: VALIDATE STOCK - Check if all products have enough quantity
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          error: `Product not found: ${item.productId}` 
        });
      }
      
      if (product.quantity < item.qty) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name?.en}. Available: ${product.quantity}, Requested: ${item.qty}` 
        });
      }
    }

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

    // STEP 2: REDUCE INVENTORY - Update product quantities after order saved
    const updatedProducts = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (product) {
        // Decrease quantity
        product.quantity -= item.qty;
        
        // Ensure quantity doesn't go below 0
        if (product.quantity < 0) {
          product.quantity = 0;
        }
        
        // Mark as out of stock if quantity is 0
        if (product.quantity === 0) {
          product.inStock = false;
        }
        
        await product.save();
        updatedProducts.push(product);
      }
    }

    // STEP 3: EMIT REAL-TIME UPDATES - Notify all clients of quantity changes
    const io = req.app.get("io");
    for (const product of updatedProducts) {
      io?.emit("product:updated", product);
      io?.emit("product:quantityChanged", {
        productId: product._id,
        newQuantity: product.quantity,
        inStock: product.inStock
      });
    }

    // Emit real-time update
    global.io?.emit("order:placed", order);

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

   const order = await Order.findById(
  req.params.id
);

if (!order) {

  return res.status(404).json({
    message: "Order not found"
  });

}

// UPDATE STATUS
order.status = status;

// ONLY WHEN DELIVERED
if (status === "delivered") {

  order.items = order.items.map(item => {

    const subtotal =
      item.price * item.qty;

    const commission =
      subtotal * 0.05;

    const farmerEarning =
      subtotal - commission;

    return {

      ...item._doc,

      commission,

      farmerEarning

    };

  });

}

await order.save();

    // Emit real-time update
    global.io?.emit("order:statusUpdated", order);

    // CONFIRMED NOTIFICATION
    if (status === "confirmed") {

      await Notification.create({

        userId: order.customerId,

        title: "Order Confirmed",

        message:
          "Your order has been confirmed by the farmer.",

        type: "order_confirmed"

      });

    }

    // CANCELLED NOTIFICATION
    if (status === "cancelled") {

      await Notification.create({

        userId: order.customerId,

        title: "Order Cancelled",

        message:
          "Your order has been cancelled by the farmer.",

        type: "order_cancelled"

      });

    }

    res.json(order);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

// CANCEL ORDER
router.delete("/cancel/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order.status !== "pending") {
      return res.json({ message: "Cannot cancel after confirmation" });
    }

    // RESTORE INVENTORY - Give back quantities to products
    const restoredProducts = [];
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      
      if (product) {
        // Restore quantity
        product.quantity += item.qty;
        
        // Mark as back in stock
        product.inStock = true;
        
        await product.save();
        restoredProducts.push(product);
      }
    }

    // EMIT REAL-TIME UPDATES - Notify all clients of restored quantities
    const io = req.app.get("io");
    for (const product of restoredProducts) {
      io?.emit("product:updated", product);
      io?.emit("product:quantityChanged", {
        productId: product._id,
        newQuantity: product.quantity,
        inStock: product.inStock
      });
    }

    await order.deleteOne();

    res.json({ message: "Order cancelled and inventory restored" });

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
  try {
    const orders = await Order.find({ customerId: req.params.id })
      .populate("items.productId", "name image price unit")
      .populate("items.farmerId", "name phone district area")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET FARMER ANALYTICS
router.get("/farmer/:id/analytics", async (req, res) => {
  try {
    const farmerId = new mongoose.Types.ObjectId(req.params.id);
    const saleStatuses = ["confirmed", "delivered"];

    const [orderStats] = await Order.aggregate([
      { $match: { "items.farmerId": farmerId } },
      { $unwind: "$items" },
      { $match: { "items.farmerId": farmerId } },
      {
        $group: {
          _id: null,
          totalOrders: { $addToSet: "$_id" },
          pendingOrders: {
            $addToSet: {
              $cond: [{ $eq: ["$status", "pending"] }, "$_id", null]
            }
          },
          confirmedOrders: {
            $addToSet: {
              $cond: [{ $eq: ["$status", "confirmed"] }, "$_id", null]
            }
          },
          deliveredOrders: {
            $addToSet: {
              $cond: [{ $eq: ["$status", "delivered"] }, "$_id", null]
            }
          },
          cancelledOrders: {
            $addToSet: {
              $cond: [{ $eq: ["$status", "cancelled"] }, "$_id", null]
            }
          },
          totalSale: {
            $sum: {
              $cond: [
                { $in: ["$status", saleStatuses] },
                { $multiply: ["$items.price", "$items.qty"] },
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalOrders: { $size: "$totalOrders" },
          pendingOrders: { $size: { $setDifference: ["$pendingOrders", [null]] } },
          confirmedOrders: { $size: { $setDifference: ["$confirmedOrders", [null]] } },
          deliveredOrders: { $size: { $setDifference: ["$deliveredOrders", [null]] } },
          cancelledOrders: { $size: { $setDifference: ["$cancelledOrders", [null]] } },
          totalSale: 1
        }
      }
    ]);

    const [productStats] = await Product.aggregate([
      { $match: { farmerId } },
      {
        $group: {
          _id: null,
          approvedProducts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isApproved", true] },
                    { $ne: ["$isDeleted", true] }
                  ]
                },
                1,
                0
              ]
            }
          },
          pendingProducts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$isApproved", true] },
                    { $ne: ["$isDeleted", true] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $project: { _id: 0, approvedProducts: 1, pendingProducts: 1 } }
    ]);

    const [bestSellingProduct] = await Order.aggregate([
      { $match: { status: { $in: saleStatuses }, "items.farmerId": farmerId } },
      { $unwind: "$items" },
      { $match: { "items.farmerId": farmerId } },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalSoldQty: { $sum: "$items.qty" }
        }
      },
      { $sort: { totalSoldQty: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: 1,
          totalSoldQty: 1,
          image: "$product.image"
        }
      }
    ]);

    const monthlySale = await Order.aggregate([
      { $match: { status: { $in: saleStatuses }, "items.farmerId": farmerId } },
      { $unwind: "$items" },
      { $match: { "items.farmerId": farmerId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          sale: { $sum: { $multiply: ["$items.price", "$items.qty"] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" }
                ]
              }
            ]
          },
          sale: 1
        }
      }
    ]);

    const recentOrders = await Order.find({ "items.farmerId": farmerId })
      .populate("customerId", "name phone district area")
      .populate("items.productId", "name image")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const farmerRecentOrders = recentOrders.map(order => ({
      ...order,
      items: order.items.filter(
        item => String(item.farmerId) === String(farmerId)
      )
    }));

    res.json({
      summary: {
        totalSale: orderStats?.totalSale || 0,
        totalOrders: orderStats?.totalOrders || 0,
        pendingOrders: orderStats?.pendingOrders || 0,
        confirmedOrders: orderStats?.confirmedOrders || 0,
        deliveredOrders: orderStats?.deliveredOrders || 0,
        cancelledOrders: orderStats?.cancelledOrders || 0,
        approvedProducts: productStats?.approvedProducts || 0,
        pendingProducts: productStats?.pendingProducts || 0
      },
      bestSellingProduct: bestSellingProduct || null,
      monthlySale,
      recentOrders: farmerRecentOrders
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET FARMER ORDERS
router.get("/farmer/:id", async (req, res) => {

  try {

    const orders = await Order.find({
      "items.farmerId": req.params.id
    })

    .populate("customerId", "name phone district area")

    .populate("items.productId", "name image")

    .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


module.exports = router;
