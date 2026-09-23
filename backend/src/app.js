// ==============================================================================
// 🛠️ app.js - THE MAIN EXPRESS APPLICATION (OPTIMIZED FOR SERVERLESS & PROD)
// ==============================================================================

require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const connectToDB = require("./config/database");

// Import route handlers
const authRouter = require("./routes/auht.routes");
const interviewRouter = require("./routes/interview.routes");

const app = express();

// CORS
app.use(cors({
    origin: "*",
    credentials: true,
}));

// 2. Parsers
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

// 3. Root health check endpoints (instant response, bypasses DB check)
app.get("/", (req, res) => {
    const dbState = ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown";
    res.status(200).json({
        status: "ok",
        message: "ResumeAI Backend is running smoothly!",
        database: dbState
    });
});

app.get("/health", (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? "healthy" : "degraded",
        database: isDbConnected ? "connected" : "disconnected",
        uptime: process.uptime()
    });
});

// 4. Industrial DB Middleware: Guarantees database readiness before API execution
app.use(async (req, res, next) => {
    try {
        await connectToDB();
        next();
    } catch (err) {
        console.error("❌ [DB Gateway] Connection failure:", err.message);
        return res.status(503).json({
            message: "Database connection failed. Please ensure MONGO_URI is set correctly in Vercel and MongoDB Atlas Network Access allows 0.0.0.0/0.",
            error: err.message
        });
    }
});

// 5. Connect API route endpoints
app.use("/api/auth", authRouter);           // Authentication (Login, Register, Logout)
app.use("/api/interview", interviewRouter); // Interview strategy, report history & resume PDF

// 6. Global 404 Handler
app.use((req, res) => {
    res.status(404).json({
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// 7. Global Error Handler
app.use((err, req, res, next) => {
    console.error("💥 [Unhandled Error]:", err);
    res.status(err.status || 500).json({
        message: err.message || "An unexpected server error occurred."
    });
});

module.exports = app;