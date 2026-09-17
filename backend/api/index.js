// ==============================================================================
// ⚡ api/index.js - VERCEL SERVERLESS ENTRYPOINT
// ==============================================================================
// Vercel runs in serverless functions (AWS Lambda) rather than a persistent daemon.
// This file connects to MongoDB and routes incoming serverless requests to our Express app!
// ==============================================================================

require("dotenv").config();
const app = require("../src/app");
const connectToDB = require("../src/config/database");

module.exports = async (req, res) => {
    // Ensure database connection is ready before processing request
    await connectToDB();
    return app(req, res);
};
