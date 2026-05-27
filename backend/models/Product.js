// models/Product.js
const mongoose = require("mongoose");

const i18nString = {
  en: { type: String, required: true },
  bn: { type: String, required: true }
};

const productSchema = new mongoose.Schema({
  //  Multilingual fields
  name: i18nString,
  category: {
    en: { type: String, required: true, enum: ["grains","vegetables","fruits","pulses","oilseed"] },
    bn: { type: String, required: true, enum:["শস্য","সবজি","ফল","ডাল","তেলশস্য"] }
  },
    price: { type: Number, required: true },
  unit: { type: String, enum: ["kg", "piece"], default: "kg" },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  district: { type: String, required: true },
  area: { type: String, required: true },

  harvestDate: { type: Date },
  inStock: { type: Boolean, default: true },
  isApproved: {
  type: Boolean,
  default: false
},
isDeleted: {
  type: Boolean,
  default: false
},
deletedAt: {
  type: Date,
  default: null
},
deletionMessage: {
  type: String,
  default: ""
},
approvedAt: {
  type: Date,
  default: null
},

approvalMessage: {
  type: String,
  default: ""
}
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
