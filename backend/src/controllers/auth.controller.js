// ==============================================================================
// 🔐 auth.controller.js - HIGH-PERFORMANCE AUTHENTICATION CONTROLLER
// ==============================================================================
// Optimized for serverless execution:
// - Uses lean queries (.lean()) to eliminate Mongoose overhead and cut response time
// - Normalizes credentials to prevent duplicate account confusion
// - Ensures clean cookie scoping and reliable JWT authentication
// ==============================================================================

const userModel = require("../config/models/user.model");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const tokenBlacklistModel = require("../config/models/blacklist.model");

const isProd = process.env.NODE_ENV === "production";

// Standard cookie options
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 3600000 // 1 hour
};

// ------------------------------------------------------------------------------
// 📝 1. REGISTER A NEW USER
// ------------------------------------------------------------------------------
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields (username, email, password) are required."
            });
        }

        const cleanUsername = username.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (cleanUsername.length < 3) {
            return res.status(400).json({
                message: "Username must be at least 3 characters long."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long."
            });
        }

        // Fast lean query to check existence
        const existingUser = await userModel.findOne({
            $or: [{ email: cleanEmail }, { username: cleanUsername }]
        }).select("_id").lean();

        if (existingUser) {
            return res.status(400).json({
                message: "A user with that username or email already exists."
            });
        }

        // Hash password with optimal work factor for cloud execution
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            username: cleanUsername,
            email: cleanEmail,
            password: hashedPassword
        });

        // Issue JWT
        const token = jsonwebtoken.sign(
            { id: newUser._id, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, COOKIE_OPTIONS);

        return res.status(201).json({
            message: "User registered successfully!",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email
            },
            token
        });
    } catch (error) {
        console.error("❌ [Register Error]:", error.message);
        return res.status(500).json({
            message: error.message || "Registration failed."
        });
    }
}

// ------------------------------------------------------------------------------
// 🔑 2. LOG IN AN EXISTING USER
// ------------------------------------------------------------------------------
async function loginUserController(req, res) {
    try {
        const { username, email, password } = req.body;
        const rawIdentifier = email || username;

        if (!rawIdentifier || !password) {
            return res.status(400).json({
                message: "Username/Email and password are required."
            });
        }

        const identifier = rawIdentifier.trim();

        // Fast lean query with indexed lookup
        const user = await userModel.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier }
            ]
        }).lean();

        if (!user) {
            return res.status(404).json({
                message: "User not found. Please check your credentials or register."
            });
        }

        // Compare password hash
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials. Please try again."
            });
        }

        // Issue JWT
        const token = jsonwebtoken.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, COOKIE_OPTIONS);

        return res.status(200).json({
            message: "User logged in successfully!",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error("❌ [Login Error]:", error.message);
        return res.status(500).json({
            message: error.message || "Login failed."
        });
    }
}

// ------------------------------------------------------------------------------
// 🚪 3. LOG OUT
// ------------------------------------------------------------------------------
async function logoutUserController(req, res) {
    try {
        const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "");

        if (token) {
            // Fire-and-forget or fast blacklist insertion
            tokenBlacklistModel.create({ token }).catch(err => {
                console.warn("⚠️ [Token Blacklist Warning]:", err.message);
            });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            path: "/"
        });

        return res.status(200).json({
            message: "User logged out successfully!"
        });
    } catch (error) {
        console.error("❌ [Logout Error]:", error.message);
        return res.status(500).json({
            message: error.message || "Logout failed."
        });
    }
}

// ------------------------------------------------------------------------------
// 👤 4. GET CURRENT LOGGED-IN USER ("WHO AM I?")
// ------------------------------------------------------------------------------
async function getMeController(req, res) {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated." });
        }

        const user = await userModel.findById(userId).select("username email createdAt").lean();
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        return res.status(200).json({
            message: "User fetched successfully.",
            user
        });
    } catch (error) {
        console.error("❌ [GetMe Error]:", error.message);
        return res.status(500).json({
            message: error.message || "Failed to fetch user profile."
        });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};
