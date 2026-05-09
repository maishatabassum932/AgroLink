const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      name: String,
      price: Number,
      qty: Number,
      farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }
  ],

  address: {
    name: String,
    phone: String,
    district: String,
    area: String
  },

  paymentMethod: {
    type: String,
    default: "COD"
  },

  totalPrice: Number,
  deliveryCharge: Number,
  finalTotal: Number,

  status: {
    type: String,
    enum: ["pending", "confirmed", "delivered", "cancelled"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);