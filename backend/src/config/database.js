// ==============================================================================
// 🗄️ database.js - INDUSTRIAL SERVERLESS MONGODB CONNECTION MANAGER
// ==============================================================================
// Implements global connection pooling and caching optimized for AWS Lambda & Vercel.
// Eliminates cold start latency, prevents socket leaks, and fails fast on errors.
// ==============================================================================

const mongoose = require("mongoose");

// Maintain cached connection promise across serverless function re-invocations
let cached = global.__mongooseCache;
if (!cached) {
    cached = global.__mongooseCache = { conn: null, promise: null };
}

async function connectToDB() {
    // 1. If connection is already alive and ready, return immediately (0ms latency)
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        const errMsg = "Missing database connection string. Ensure MONGO_URI or MONGODB_URI is set in environment variables.";
        console.error(`❌ [Database Error] ${errMsg}`);
        throw new Error(errMsg);
    }

    // 2. If no connection promise is in-flight, initialize one
    if (!cached.promise) {
        const options = {
            bufferCommands: false, // Critical: Disable command buffering so queries fail immediately if not connected
            serverSelectionTimeoutMS: 5000, // 5s timeout instead of hanging
            socketTimeoutMS: 45000,
            maxPoolSize: 10, // Maintain optimal connection pool for serverless concurrency
            minPoolSize: 0,
        };

        cached.promise = mongoose.connect(mongoUri, options)
            .then((m) => {
                console.log("✅ [Database] Connected to MongoDB Atlas successfully!");
                return m;
            })
            .catch((err) => {
                cached.promise = null; // Reset so subsequent requests can re-attempt
                console.error("❌ [Database] Connection failed:", err.message);
                if (err.message.includes("whitelist") || err.name === "MongooseServerSelectionError") {
                    console.error("💡 [Tip] Check MongoDB Atlas -> Network Access and make sure IP Whitelist allows 0.0.0.0/0 for Vercel/Lambda.");
                }
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        throw err;
    }

    return cached.conn;
}

module.exports = connectToDB;