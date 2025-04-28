const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// Public routes
router.post("/login", userController.login);

// Protected routes
router.get("/profile", auth, userController.getProfile);
router.get("/all", auth, userController.getAllUsers);
router.get("/:userId", auth, userController.getUserDetails);

module.exports = router;
