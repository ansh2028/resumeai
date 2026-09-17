// ==============================================================================
// 👤 user.model.js - DATABASE BLUEPRINT FOR USER ACCOUNTS
// ==============================================================================
// Every user who signs up gets a document in MongoDB formatted by this blueprint:
// - username: Must be unique (no two users can share the same name).
// - email: Must be unique and converted to lowercase so casing doesn't cause duplicates.
// - password: Stored as an encrypted bcrypt hash string for top security.
// ==============================================================================

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "Username already exists"],
        required: [true, "Username is required"]
    },
    email: {
        type: String,
        unique: [true, "Email already exists"],
        lowercase: true,
        trim: true,
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    }
}, {
    timestamps: true // Automatically tracks createdAt and updatedAt dates
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
