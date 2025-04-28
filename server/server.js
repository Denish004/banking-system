require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import routes
const userRoutes = require("./routes/userRoutes");
const accountRoutes = require("./routes/accountRoutes");

// Initialize express
const app = express();

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://banking-system-one-omega.vercel.app",
        "http://localhost:3000",
      ];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
