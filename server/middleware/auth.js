const User = require("../models/userModel");

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    // Verify token
    const user = await User.verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: "Token is not valid" });
    }

    // Set user info in request
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = auth;
