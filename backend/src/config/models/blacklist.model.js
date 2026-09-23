// ==============================================================================
// 🚫 blacklist.model.js - OPTIMIZED LOGGED-OUT TOKENS LIST
// ==============================================================================

const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Automatically self-destructs after 1 hour!
    }
});

const tokenBlacklistModel = mongoose.models.tokenBlacklist || mongoose.model("tokenBlacklist", blacklistSchema);

module.exports = tokenBlacklistModel;