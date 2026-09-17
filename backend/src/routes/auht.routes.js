// ==============================================================================
// 🚦 auht.routes.js - AUTHENTICATION ROUTE DIRECTORY
// ==============================================================================
// This file connects auth URLs to the controller functions in auth.controller.js:
// - POST /api/auth/register -> Create account
// - POST /api/auth/login    -> Log in
// - POST /api/auth/logout   -> Log out
// - GET  /api/auth/get-me   -> Check currently logged-in user
// ==============================================================================

const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/auth.controller");
const { authUser } = require("../middlewares/auth.middleware");

// Public routes (anyone can visit)
authRouter.post("/register", authController.registerUserController);
authRouter.post("/login", authController.loginUserController);
authRouter.post("/logout", authController.logoutUserController);

// Protected route (only logged-in users with valid cookie can visit)
authRouter.get("/get-me", authUser, authController.getMeController);

module.exports = authRouter;