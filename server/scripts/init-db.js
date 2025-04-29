require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function initDatabase() {
  console.log("Initializing database...");

  // Extract host and port from connection string
  const connectionString = process.env.MYSQLHOST;
  const hostMatch = connectionString.match(/@([^:]+):(\d+)/);

  if (!hostMatch) {
    console.error("Could not parse connection string");
    return;
  }

  const host = hostMatch[1];
  const port = parseInt(hostMatch[2]);

  console.log(`Connecting to: ${host}:${port}`);

  try {
    // Create connection with SSL disabled and authentication options
    const connection = await mysql.createConnection({
      host: host,
      port: port,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      multipleStatements: true,
      ssl: { rejectUnauthorized: false },
      // Add specific authentication handling
      authPlugins: {
        mysql_native_password: () => () =>
          Buffer.from(process.env.MYSQLPASSWORD + "\0"),
      },
    });

    // Read SQL file
    const sqlPath = path.join(__dirname, "../config/dbSetup.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Remove the CREATE DATABASE and USE statements
    const modifiedSql = sql
      .replace(/CREATE DATABASE IF NOT EXISTS Bank;/g, "")
      .replace(/USE Bank;/g, "");

    // Execute the SQL
    console.log("Running SQL script...");
    await connection.query(modifiedSql);
    console.log("Database initialized successfully!");

    await connection.end();
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

initDatabase();
