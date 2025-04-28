const User = require("../models/userModel");
const Account = require("../models/accountModel");
const Transaction = require("../models/transactionModel");

// Handle user login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await User.login(username, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all users (banker only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "banker") {
      return res.status(403).json({ error: "Access denied" });
    }

    const users = await User.getAllUsers();

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get user details with account and transaction info (for banker)
exports.getUserDetails = async (req, res) => {
  try {
    if (req.user.role !== "banker") {
      return res.status(403).json({ error: "Access denied" });
    }

    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const accounts = await Account.findByUserId(userId);

    // Get transactions for all accounts
    const transactions = [];
    for (const account of accounts) {
      const accountTransactions = await Transaction.findByAccountId(account.id);
      transactions.push(...accountTransactions);
    }

    // Sort transactions by date (newest first)
    transactions.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    res.json({
      success: true,
      user,
      accounts,
      transactions,
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
