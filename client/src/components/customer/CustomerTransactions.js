import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Alert,
  Nav,
  Button,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const CustomerTransactions = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load user data and transactions
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const [userRes, transactionsRes] = await Promise.all([
          axios.get(`${API_URL}/api/users/profile`, {
            headers: { Authorization: token },
          }),
          axios.get(`${API_URL}/api/accounts/transactions`, {
            headers: { Authorization: token },
          }),
        ]);

        setUser(userRes.data.user);
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
            <Nav.Link as={Link} to="/dashboard">
              Dashboard
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active>Transactions</Nav.Link>
          </Nav.Item>
        </Nav>

        <h3>All Transactions</h3>
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Account</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance Before</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.created_at).toLocaleString()}</td>
                  <td>{transaction.account_id}</td>
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
                  <td colSpan="6" className="text-center">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="mt-3 mb-5">
          <Button variant="primary" as={Link} to="/dashboard">
            Back to Dashboard
          </Button>
        </div>
      </Container>
    </Container>
  );
};

export default CustomerTransactions;
