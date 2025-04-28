# Banking System

A simple banking system built using React.js for the frontend, Node.js with Express for the backend, and MySQL for the database, following the MVC (Model-View-Controller) architecture.

## Features

### Customer Features

- Secure login with access token authentication
- View account balance and transaction history
- Deposit and withdraw funds
- View detailed transaction records

### Banker Features

- Separate login portal for bank staff
- View all customer accounts
- View transaction histories for any customer
- Perform deposit and withdrawal operations on behalf of customers

## Technology Stack

- **Frontend**: React.js with React Bootstrap for UI components
- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Authentication**: Custom token-based authentication

## Setup Instructions

### Prerequisites

- Node.js (v14+ recommended)
- MySQL Server
- npm or yarn

### Database Setup

1. Create a MySQL database:

```sql
CREATE DATABASE Bank;
```

2. Import the database schema:

```bash
mysql -u your_username -p Bank < server/config/dbSetup.sql
```

### Backend Setup

1. Navigate to the server directory:

```bash
cd banking-system/server
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the server directory
   - Add the following variables:

```
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=Bank
```

4. Start the server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:

```bash
cd banking-system/client
```

2. Install dependencies:

```bash
npm install
```

3. Start the React development server:

```bash
npm start
```

## Usage

1. Access the customer login at: http://localhost:3000/login

   - Default customer credentials:
     - Username: customer
     - Password: customer123

2. Access the banker login at: http://localhost:3000/banker/login
   - Default banker credentials:
     - Username: banker
     - Password: banker123

## API Endpoints

### User Routes

- POST /api/users/login - User login (both customers and bankers)
- GET /api/users/profile - Get user profile (requires auth)
- GET /api/users/all - Get all users (banker only)
- GET /api/users/:userId - Get user details with accounts and transactions (banker only)

### Account Routes

- GET /api/accounts - Get user's accounts
- GET /api/accounts/all - Get all accounts (banker only)
- GET /api/accounts/transactions - Get all transactions for user
- GET /api/accounts/:accountId/transactions - Get transactions for specific account
- POST /api/accounts/deposit - Deposit funds
- POST /api/accounts/withdraw - Withdraw funds

## Project Structure

The project follows an MVC architecture:

### Backend (server)

- `models/` - Data models and database interaction
- `controllers/` - Business logic and request handling
- `routes/` - API endpoint definitions
- `config/` - Database and environment configurations
- `middleware/` - Authentication and request middleware

### Frontend (client)

- `components/` - React components
  - `auth/` - Login components
  - `customer/` - Customer view components
  - `banker/` - Banker view components
  - `common/` - Shared components
