const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require("./routes/userRoutes");
const accountRoutes = require("./routes/accountRoutes");

// Initialize express
const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/accounts", accountRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Banking System API is running...");
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
