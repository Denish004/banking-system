const { pool } = require("../config/db");

class Account {
  // Get account by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query("SELECT * FROM Accounts WHERE id = ?", [
        id,
      ]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error("Error finding account by ID:", error);
      throw error;
    }
  }

  // Get account by user ID
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM Accounts WHERE user_id = ?",
        [userId]
      );
      return rows;
    } catch (error) {
      console.error("Error finding account by user ID:", error);
      throw error;
    }
  }

  // Get all accounts (for banker only)
  static async getAllAccounts() {
    try {
      const [rows] = await pool.query(`
        SELECT a.*, u.username, u.full_name 
        FROM Accounts a 
        JOIN Users u ON a.user_id = u.id
      `);
      return rows;
    } catch (error) {
      console.error("Error getting all accounts:", error);
      throw error;
    }
  }

  // Update account balance
  static async updateBalance(id, newBalance) {
    try {
      await pool.query("UPDATE Accounts SET balance = ? WHERE id = ?", [
        newBalance,
        id,
      ]);
      return await this.findById(id);
    } catch (error) {
      console.error("Error updating account balance:", error);
      throw error;
    }
  }

  // Deposit funds into account
  static async deposit(id, amount) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get current account details
      const [accountRows] = await connection.query(
        "SELECT * FROM Accounts WHERE id = ? FOR UPDATE",
        [id]
      );

      if (!accountRows.length) {
        throw new Error("Account not found");
      }

      const account = accountRows[0];
      const balanceBefore = parseFloat(account.balance);
      const balanceAfter = balanceBefore + parseFloat(amount);

      // Update account balance
      await connection.query("UPDATE Accounts SET balance = ? WHERE id = ?", [
        balanceAfter,
        id,
      ]);

      // Record transaction
      await connection.query(
        "INSERT INTO Transactions (account_id, type, amount, balance_before, balance_after) VALUES (?, ?, ?, ?, ?)",
        [id, "deposit", amount, balanceBefore, balanceAfter]
      );

      await connection.commit();

      return {
        success: true,
        balance: balanceAfter,
        message: `Successfully deposited ${amount}`,
      };
    } catch (error) {
      await connection.rollback();
      console.error("Error depositing funds:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Withdraw funds from account
  static async withdraw(id, amount) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get current account details
      const [accountRows] = await connection.query(
        "SELECT * FROM Accounts WHERE id = ? FOR UPDATE",
        [id]
      );

      if (!accountRows.length) {
        throw new Error("Account not found");
      }

      const account = accountRows[0];
      const balanceBefore = parseFloat(account.balance);

      // Check if sufficient funds
      if (balanceBefore < parseFloat(amount)) {
        return {
          success: false,
          balance: balanceBefore,
          message: "Insufficient Funds",
        };
      }

      const balanceAfter = balanceBefore - parseFloat(amount);

      // Update account balance
      await connection.query("UPDATE Accounts SET balance = ? WHERE id = ?", [
        balanceAfter,
        id,
      ]);

      // Record transaction
      await connection.query(
        "INSERT INTO Transactions (account_id, type, amount, balance_before, balance_after) VALUES (?, ?, ?, ?, ?)",
        [id, "withdrawal", amount, balanceBefore, balanceAfter]
      );

      await connection.commit();

      return {
        success: true,
        balance: balanceAfter,
        message: `Successfully withdrew ${amount}`,
      };
    } catch (error) {
      await connection.rollback();
      console.error("Error withdrawing funds:", error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Account;
