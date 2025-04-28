-- Create Bank database
CREATE DATABASE IF NOT EXISTS Bank;
USE Bank;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('customer', 'banker') NOT NULL DEFAULT 'customer',
  access_token VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Accounts table
CREATE TABLE IF NOT EXISTS Accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  account_number VARCHAR(20) NOT NULL UNIQUE,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Create Transactions table
CREATE TABLE IF NOT EXISTS Transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  type ENUM('deposit', 'withdrawal') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  balance_before DECIMAL(15, 2) NOT NULL,
  balance_after DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES Accounts(id)
);

-- Insert sample data for testing
-- Sample banker user (password: banker123)
INSERT INTO Users (username, email, password, full_name, role)
VALUES ('banker', 'banker@bank.com', '$2b$10$5GMZnRAbV7yWdYawQUAUbuo3XnVOt6TFT0bfmT3o5mYPMjXbGnbrO', 'Bank Manager', 'banker');

-- Sample customer user (password: customer123)
INSERT INTO Users (username, email, password, full_name, role)
VALUES ('customer', 'customer@example.com', '$2b$10$QMY0EoJlUjmNrdOi5ByaXOPMfDjvzTOs3f8jMD4X0H4zOUkonOdp.', 'John Doe', 'customer');

-- Create account for customer
INSERT INTO Accounts (user_id, account_number, balance)
VALUES (2, 'AC00000001', 1000.00);

-- Sample transactions
INSERT INTO Transactions (account_id, type, amount, balance_before, balance_after)
VALUES (1, 'deposit', 1000.00, 0.00, 1000.00);