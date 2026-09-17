// ==============================================================================
// 📦 file.middleware.js - THE FILE MAILMAN (MULTER)
// ==============================================================================
// When a user uploads their resume PDF from the browser, it arrives as raw bytes.
// Multer acts like a mailman:
// - It grabs the file from the request.
// - It keeps it safely in computer memory (memoryStorage) as `req.file.buffer`.
// - It sets a safe maximum limit of 10 MB so nobody can crash our server.
// ==============================================================================

const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(), // Keep file in memory for instant processing
    limits: {
        fileSize: 10 * 1024 * 1024   // 10 Megabytes max file size
    }
});

module.exports = upload;