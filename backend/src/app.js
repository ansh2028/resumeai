// ==============================================================================
// 🛠️ app.js - THE MAIN EXPRESS APPLICATION
// ==============================================================================
// Think of this file like the Reception Desk of our backend.
// It sets up the rules for how visitors (frontend requests) are handled:
// - It unpacks JSON packets sent by the browser.
// - It inspects browser cookies (where auth tokens live).
// - It sets up CORS so our frontend at localhost:5173 can talk to port 3000.
// - It directs visitors to the right hallway: /api/auth or /api/interview.
// ==============================================================================

require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Import route handlers

const authRouter = require("./routes/auht.routes");
const interviewRouter = require("./routes/interview.routes");

const app = express();

// 1. CORS: Allow our React frontend to communicate with this backend and send cookies
app.use(cors({
    origin: true,
    credentials: true // Crucial: allows cookies to be sent back and forth!
}));

// 2. JSON Parser: Allows reading JSON sent in request bodies (req.body)
app.use(express.json());

// 3. Cookie Parser: Automatically reads cookies sent by the browser (req.cookies)
app.use(cookieParser());

// 4. Root health check endpoint (shows backend status when visited directly)
app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", message: "ResumeAI Backend is running smoothly!" });
});

// 5. Connect our route endpoints
app.use("/api/auth", authRouter);           // Authentication (Login, Register, Logout)
app.use("/api/interview", interviewRouter); // Interview strategy, report history & resume PDF

module.exports = app;