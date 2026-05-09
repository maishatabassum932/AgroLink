const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone:{
        type: String,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    nidNumber: {
    type: String,
    required: true,
    unique: true
},
    role: {
        type: String,
        enum: ["admin", "farmer", "customer"],
        default: "customer"
    },
    district: {
        type: String  
    },
    area: {
        type: String
    },

    warningCount: {
    type: Number,
    default: 0
    },
    isBlocked: {
    type: Boolean,
    default: false
    },
    blockedUntil: {
    type: Date,
    default: null
}
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);