const { pool } = require("../config/db");

class Transaction {
  // Get transaction by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM Transactions WHERE id = ?",
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error("Error finding transaction by ID:", error);
      throw error;
    }
  }

  // Get transactions by account ID
  static async findByAccountId(accountId) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM Transactions WHERE account_id = ? ORDER BY created_at DESC",
        [accountId]
      );
      return rows;
    } catch (error) {
      console.error("Error finding transactions by account ID:", error);
      throw error;
    }
  }

  // Get transactions for a user
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.query(
        `
        SELECT t.* 
        FROM Transactions t
        JOIN Accounts a ON t.account_id = a.id
        WHERE a.user_id = ?
        ORDER BY t.created_at DESC
      `,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error("Error finding transactions by user ID:", error);
      throw error;
    }
  }
}

module.exports = Transaction;
