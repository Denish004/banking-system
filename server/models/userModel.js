const { pool } = require("../config/db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

class User {
  // Get user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        "SELECT id, username, email, full_name, role, access_token FROM Users WHERE id = ?",
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  // Get user by username or email
  static async findByCredentials(usernameOrEmail) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM Users WHERE username = ? OR email = ?",
        [usernameOrEmail, usernameOrEmail]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error("Error finding user by credentials:", error);
      throw error;
    }
  }

  // Login user and generate access token
  static async login(usernameOrEmail, password) {
    try {
      console.log(`Attempting login for: ${usernameOrEmail}`);

      const user = await this.findByCredentials(usernameOrEmail);

      if (!user) {
        console.log("User not found");
        return null; // User not found
      }

      console.log("User found, comparing passwords");

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);

      console.log(`Password match result: ${isMatch}`);

      if (!isMatch) {
        return null; // Invalid password
      }

      // Generate access token (36 characters as required)
      const accessToken = uuidv4();

      // Update user with access token
      await pool.query("UPDATE Users SET access_token = ? WHERE id = ?", [
        accessToken,
        user.id,
      ]);

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        access_token: accessToken,
      };
    } catch (error) {
      console.error("Error logging in user:", error);
      throw error;
    }
  }

  // Verify access token
  static async verifyToken(token) {
    try {
      const [rows] = await pool.query(
        "SELECT id, username, email, full_name, role FROM Users WHERE access_token = ?",
        [token]
      );

      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error("Error verifying token:", error);
      throw error;
    }
  }

  // Get all users (for banker only)
  static async getAllUsers() {
    try {
      const [rows] = await pool.query(
        'SELECT id, username, email, full_name, role FROM Users WHERE role = "customer"'
      );
      return rows;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }
}

module.exports = User;
