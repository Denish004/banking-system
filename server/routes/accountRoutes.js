const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const auth = require("../middleware/auth");

// All routes are protected
router.use(auth);

// Get user's accounts
router.get("/", accountController.getUserAccounts);

// Get all accounts (banker only)
router.get("/all", accountController.getAllAccounts);

// Get all transactions for user
router.get("/transactions", accountController.getAllTransactions);

// Get transactions for specific account
router.get(
  "/:accountId/transactions",
  accountController.getAccountTransactions
);

// Deposit funds
router.post("/deposit", accountController.deposit);

// Withdraw funds
router.post("/withdraw", accountController.withdraw);

module.exports = router;
