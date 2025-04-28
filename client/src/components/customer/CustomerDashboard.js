import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Nav,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Transaction modal state
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [amount, setAmount] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  const [transactionError, setTransactionError] = useState("");
  const [transactionSuccess, setTransactionSuccess] = useState("");

  useEffect(() => {
    // Load user data, accounts, and transactions
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const API_URL = process.env.REACT_APP_API_URL;

        const [userRes, accountsRes, transactionsRes] = await Promise.all([
          axios.get(`${API_URL}/api/users/profile`, {
            headers: { Authorization: token },
          }),
          axios.get(`${API_URL}/api/accounts`, {
            headers: { Authorization: token },
          }),
          axios.get(`${API_URL}/api/accounts/transactions`, {
            headers: { Authorization: token },
          }),
        ]);

        setUser(userRes.data.user);
        setAccounts(accountsRes.data.accounts);
        setTransactions(transactionsRes.data.transactions);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error loading data. Please try again.");

        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const openTransactionModal = (type, account) => {
    setTransactionType(type);
    setCurrentAccount(account);
    setAmount("");
    setTransactionError("");
    setTransactionSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    setTransactionError("");
    setTransactionSuccess("");

    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setTransactionError("Please enter a valid amount greater than zero.");
      return;
    }

    // Check for insufficient funds before making the request
    if (
      transactionType === "withdraw" &&
      amountValue > parseFloat(currentAccount.balance)
    ) {
      setTransactionError("Insufficient Funds");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const API_URL = process.env.REACT_APP_API_URL;
      const endpoint =
        transactionType === "deposit"
          ? `${API_URL}/api/accounts/deposit`
          : `${API_URL}/api/accounts/withdraw`;

      const response = await axios.post(
        endpoint,
        {
          accountId: currentAccount.id,
          amount: amountValue,
        },
        {
          headers: { Authorization: token },
        }
      );

      if (response.data.success) {
        setTransactionSuccess(response.data.message);

        // Update account balance in state
        setAccounts(
          accounts.map((account) =>
            account.id === currentAccount.id
              ? { ...account, balance: response.data.balance }
              : account
          )
        );

        // Refresh transactions
        const transactionsRes = await axios.get(
          `${API_URL}/api/accounts/transactions`,
          {
            headers: { Authorization: token },
          }
        );
        setTransactions(transactionsRes.data.transactions);

        // Close modal after a short delay
        setTimeout(() => {
          setShowModal(false);
        }, 2000);
      } else {
        setTransactionError(response.data.message);
      }
    } catch (err) {
      console.error("Transaction error:", err);
      // Check for message field first, then error field
      setTransactionError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Transaction failed. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <Container fluid>
      <Row className="py-3 bg-primary text-white">
        <Col>
          <Container>
            <div className="d-flex justify-content-between align-items-center">
              <h2>Banking System</h2>
              <div>
                <span className="me-3">Welcome, {user?.full_name}</span>
                <Button variant="light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </Container>
        </Col>
      </Row>

      <Container className="mt-4">
        {error && <Alert variant="danger">{error}</Alert>}

        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link active>Dashboard</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/transactions">
              Transactions
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <h3>Your Accounts</h3>
        <Row>
          {accounts.map((account) => (
            <Col md={6} key={account.id} className="mb-3">
              <Card>
                <Card.Header>
                  <strong>Account #: {account.account_number}</strong>
                </Card.Header>
                <Card.Body>
                  <Card.Title className="text-success">
                    Balance: ${parseFloat(account.balance).toFixed(2)}
                  </Card.Title>
                  <div className="mt-3">
                    <Button
                      variant="success"
                      className="me-2"
                      onClick={() => openTransactionModal("deposit", account)}
                    >
                      Deposit
                    </Button>
                    <Button
                      variant="warning"
                      onClick={() => openTransactionModal("withdraw", account)}
                    >
                      Withdraw
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <h3 className="mt-4">Recent Transactions</h3>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Balance Before</th>
              <th>Balance After</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((transaction) => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.created_at).toLocaleString()}</td>
                <td>
                  <span
                    className={
                      transaction.type === "deposit"
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    {transaction.type.charAt(0).toUpperCase() +
                      transaction.type.slice(1)}
                  </span>
                </td>
                <td>${parseFloat(transaction.amount).toFixed(2)}</td>
                <td>${parseFloat(transaction.balance_before).toFixed(2)}</td>
                <td>${parseFloat(transaction.balance_after).toFixed(2)}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {transactions.length > 5 && (
          <div className="text-center mb-4">
            <Link to="/transactions">View All Transactions</Link>
          </div>
        )}
      </Container>

      {/* Transaction Modal */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {transactionType === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentAccount && (
            <>
              <p>Account: {currentAccount.account_number}</p>
              <p>
                Available Balance: $
                {parseFloat(currentAccount.balance).toFixed(2)}
              </p>

              {transactionError && (
                <Alert variant="danger">{transactionError}</Alert>
              )}
              {transactionSuccess && (
                <Alert variant="success">{transactionSuccess}</Alert>
              )}

              <Form onSubmit={handleTransaction}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </Form.Group>
                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    variant={
                      transactionType === "deposit" ? "success" : "warning"
                    }
                    type="submit"
                  >
                    {transactionType === "deposit" ? "Deposit" : "Withdraw"}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CustomerDashboard;
