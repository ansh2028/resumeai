// ==============================================================================
// 🔐 auth.controller.js - USER AUTHENTICATION BRAIN
// ==============================================================================
// This file handles everything about user accounts:
// 1. registerUserController: Creates a new user, hashes password, generates JWT cookie.
// 2. loginUserController: Checks credentials, creates JWT cookie.
// 3. logoutUserController: Blacklists current token and deletes cookie from browser.
// 4. getMeController: Checks who is currently logged in using req.user.
// ==============================================================================

const userModel = require("../config/models/user.model");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const tokenBlacklistModel = require("../config/models/blacklist.model");

// ------------------------------------------------------------------------------
// 📝 1. REGISTER A NEW USER
// ------------------------------------------------------------------------------
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        // Step A: Check that no fields are left blank
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields (username, email, password) are required."
            });
        }

        // Step B: Check if someone already took this email or username
        const isUser = await userModel.findOne({ $or: [{ email }, { username }] });
        if (isUser) {
            return res.status(400).json({
                message: "A user with that username or email already exists."
            });
        }

        // Step C: Scramble (hash) the password so it's safe
        const hash = await bcrypt.hash(password, 10);

        // Step D: Save the new user in MongoDB
        const user = await userModel.create({
            username,
            email,
            password: hash
        });

        // Step E: Create a signed JWT VIP wristband that expires in 1 hour
        const token = jsonwebtoken.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Step F: Store the token inside a browser cookie
        const isProd = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 3600000
        });

        return res.status(201).json({
            message: "User registered successfully!",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });
    } catch (error) {
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
        const identifier = email || username;

        // Step A: Make sure credentials were typed in
        if (!identifier || !password) {
            return res.status(400).json({
                message: "Username/Email and password are required."
            });
        }

        // Step B: Search MongoDB for this user
        const user = await userModel.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user) {
            return res.status(404).json({
                message: "User not found. Please check your credentials or register."
            });
        }

        // Step C: Compare typed password against the encrypted hash in MongoDB
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password. Please try again."
            });
        }

        // Step D: Create a signed JWT VIP wristband that lasts 1 hour
        const token = jsonwebtoken.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Step E: Set the cookie in the user's browser
        const isProd = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 3600000
        });

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

        // Step A: Put the token in the blacklist so it can never be used again
        if (token) {
            await tokenBlacklistModel.create({ token });
        }

        // Step B: Tell the user's browser to destroy the cookie
        const isProd = process.env.NODE_ENV === "production";
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax"
        });

        return res.status(200).json({
            message: "User logged out successfully!"
        });
    } catch (error) {
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
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        return res.status(200).json({
            message: "User fetched successfully.",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to fetch user."
        });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};

