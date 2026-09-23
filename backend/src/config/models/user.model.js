// ==============================================================================
// 👤 user.model.js - OPTIMIZED USER MODEL
// ==============================================================================

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "Username is required"],
        trim: true,
        index: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: [true, "Email is required"],
        index: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    }
}, {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== "production"
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = userModel;
