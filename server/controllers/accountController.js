const Account = require("../models/accountModel");
const Transaction = require("../models/transactionModel");

// Get user accounts
exports.getUserAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const accounts = await Account.findByUserId(userId);

    res.json({
      success: true,
      accounts,
    });
  } catch (error) {
    console.error("Get user accounts error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get account transactions
exports.getAccountTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.accountId;

    // Verify account belongs to user unless banker
    if (req.user.role !== "banker") {
      const accounts = await Account.findByUserId(userId);
      const accountBelongsToUser = accounts.some(
        (account) => account.id.toString() === accountId
      );

      if (!accountBelongsToUser) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const transactions = await Transaction.findByAccountId(accountId);

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Get account transactions error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all transactions for user
exports.getAllTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.findByUserId(userId);

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Get all transactions error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all accounts (banker only)
exports.getAllAccounts = async (req, res) => {
  try {
    if (req.user.role !== "banker") {
      return res.status(403).json({ error: "Access denied" });
    }

    const accounts = await Account.getAllAccounts();

    res.json({
      success: true,
      accounts,
    });
  } catch (error) {
    console.error("Get all accounts error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Deposit funds
exports.deposit = async (req, res) => {
  try {
    const { accountId, amount } = req.body;

    if (!accountId || !amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({ error: "Valid account ID and amount are required" });
    }

    // Verify account belongs to user unless banker
    if (req.user.role !== "banker") {
      const userId = req.user.id;
      const accounts = await Account.findByUserId(userId);
      const accountBelongsToUser = accounts.some(
        (account) => account.id.toString() === accountId.toString()
      );

      if (!accountBelongsToUser) {
        console.log(
          `Access denied: Account ${accountId} does not belong to user ${userId}`
        );
        console.log(
          "Available accounts:",
          accounts.map((a) => a.id)
        );
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const result = await Account.deposit(accountId, parseFloat(amount));

    res.json({
      success: result.success,
      message: result.message,
      balance: result.balance,
    });
  } catch (error) {
    console.error("Deposit error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Withdraw funds
exports.withdraw = async (req, res) => {
  try {
    const { accountId, amount } = req.body;

    if (!accountId || !amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({ error: "Valid account ID and amount are required" });
    }

    // Verify account belongs to user unless banker
    if (req.user.role !== "banker") {
      const userId = req.user.id;
      const accounts = await Account.findByUserId(userId);
      const accountBelongsToUser = accounts.some(
        (account) => account.id.toString() === accountId.toString()
      );

      if (!accountBelongsToUser) {
        console.log(
          `Access denied: Account ${accountId} does not belong to user ${userId}`
        );
        console.log(
          "Available accounts:",
          accounts.map((a) => a.id)
        );
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const result = await Account.withdraw(accountId, parseFloat(amount));

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        balance: result.balance,
      });
    }

    res.json({
      success: result.success,
      message: result.message,
      balance: result.balance,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
