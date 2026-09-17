// ==============================================================================
// 🛡️ auth.middleware.js - THE SECURITY BOUNCER
// ==============================================================================
// Before any user can access private areas (like generating or viewing reports),
// this function checks their browser cookie for a valid JWT VIP wristband!
// - If no cookie exists -> 401 Unauthorized ("Please log in first!")
// - If cookie is fake or expired -> 403 Forbidden ("Invalid token!")
// - If valid -> attaches user details to `req.user` and calls `next()` to let them in!
// ==============================================================================

const jwt = require("jsonwebtoken");

function authUser(req, res, next) {
    // 1. Grab the "token" either from the browser cookie OR the Authorization header
    const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized: No token provided. Please log in first."
        });
    }

    // 2. Decrypt and verify the token using our secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: "Forbidden: Invalid or expired token."
            });
        }

        // 3. Attach the verified user object to the request
        req.user = user;

        // 4. Everything looks great! Pass the user along to the next step!
        next();
    });
}

module.exports = { authUser };