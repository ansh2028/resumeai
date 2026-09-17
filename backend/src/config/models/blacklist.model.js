// ==============================================================================
// 🚫 blacklist.model.js - LOGGED-OUT TOKENS LIST
// ==============================================================================
// When a user clicks "Log Out", we take their active JWT cookie and put it here.
// Even if someone stole that cookie, our server checks this blacklist and rejects it!
// It has "expires: 3600" (1 hour), so MongoDB automatically erases old records.
// ==============================================================================

const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Automatically self-destructs after 1 hour!
    }
});

const tokenBlacklistModel = mongoose.model("tokenBlacklist", blacklistSchema);

module.exports = tokenBlacklistModel;