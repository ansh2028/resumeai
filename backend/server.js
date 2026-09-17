// ==============================================================================
// 🚀 server.js - THE POWER SWITCH
// ==============================================================================
// This is the starting line of our backend server!
// When you type "npm run dev", Node.js runs this file first.
// It loads secrets from .env, connects to the MongoDB database,
// and starts listening for requests from our React website.
// ==============================================================================

require("dotenv").config(); // 1. Load secret keys (like DB passwords and AI keys) from .env
const app = require("./src/app"); // 2. Grab our configured Express application
const connectToDB = require("./src/config/database"); // 3. Grab our MongoDB database connection function

const PORT = process.env.PORT || 3000;

// 4. Connect to our cloud database (MongoDB Atlas)
connectToDB();

// 5. Start listening for incoming visitors on port 3000!
app.listen(PORT, () => {
    console.log(`🚀 Server is up and running on http://localhost:${PORT}`);
});