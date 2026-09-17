// ==============================================================================
// 🗄️ database.js - CONNECTING TO MONGODB
// ==============================================================================
// MongoDB is our cloud filing cabinet.
// This function connects our Node.js app to MongoDB Atlas using Mongoose.
// If the connection succeeds, it prints "Connected to MongoDB".
// If anything goes wrong (like wrong password), it warns us in the console.
// ==============================================================================

const mongoose = require("mongoose");

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB Atlas successfully!");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error.message);
    }
}

module.exports = connectToDB;