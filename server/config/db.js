const mysql = require("mysql2/promise");
require("dotenv").config();

// Log connection parameters (remove passwords in production)
console.log("Connecting to MySQL with:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "Bank",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");

    // Test query to verify access to Users table
    const [rows] = await connection.query(
      "SELECT COUNT(*) as count FROM Users"
    );
    console.log(`Found ${rows[0].count} users in database`);

    connection.release();
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
};
