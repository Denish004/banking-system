const mysql = require("mysql2/promise");
require("dotenv").config();

// Extract host and port from connection string
let host, port;

try {
  const connectionString = process.env.DB_HOST || process.env.MYSQLHOST;
  const hostMatch = connectionString.match(/@([^:]+):(\d+)/);

  if (hostMatch) {
    host = hostMatch[1];
    port = parseInt(hostMatch[2]);
    console.log(`Parsed connection string to: ${host}:${port}`);
  } else {
    host = process.env.DB_HOST || "localhost";
    port = process.env.DB_PORT || 3306;
  }
} catch (err) {
  console.error("Error parsing connection string:", err);
  host = process.env.DB_HOST || "localhost";
  port = process.env.DB_PORT || 3306;
}

// Create a connection pool with SSL and authentication options
const pool = mysql.createPool({
  host: host,
  port: port,
  user: process.env.DB_USER || process.env.MYSQLUSER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || "railway",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false },
  authPlugins: {
    mysql_native_password: () => () =>
      Buffer.from(
        (process.env.DB_PASSWORD || process.env.MYSQLPASSWORD) + "\0"
      ),
  },
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
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
