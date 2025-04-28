import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const BankerUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Transaction modal state
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('');
  const [amount, setAmount] = useState('');
  const [currentAccount, setCurrentAccount] = useState(null);
  const [transactionError, setTransactionError] = useState('');
  const [transactionSuccess, setTransactionSuccess] = useState('');

  useEffect(() => {
    // Load banker data and customer details
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/banker/login');
          return;
        }

        const [userRes, customerRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: token }
          }),
          axios.get(`http://localhost:5000/api/users/${userId}`, {
            headers: { Authorization: token }
          })
        ]);
        
        // Verify that the user is a banker
        if (userRes.data.user.role !== 'banker') {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          navigate('/banker/login');
          return;
        }
        
        setUser(userRes.data.user);
        setCustomerData(customerRes.data);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error loading data. Please try again.');
        
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          navigate('/banker/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/banker/login');
  };

  const openTransactionModal = (type, account) => {
    setTransactionType(type);
    setCurrentAccount(account);
    setAmount('');
    setTransactionError('');
    setTransactionSuccess('');
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    setTransactionError('');
    setTransactionSuccess('');
    
    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setTransactionError('Please enter a valid amount greater than zero.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/banker/login');
        return;
      }

      const endpoint = transactionType === 'deposit'
        ? 'http://localhost:5000/api/accounts/deposit'
        : 'http://localhost:5000/api/accounts/withdraw';
      
      const response = await axios.post(
        endpoint, 
        {
          accountId: currentAccount.id,
          amount: amountValue
        },
        {
          headers: { Authorization: token }
        }
      );
      
      if (response.data.success) {
        setTransactionSuccess(response.data.message);
        
        // Refresh customer data to update account balance
        const customerRes = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: token }
        });
        
        setCustomerData(customerRes.data);
        
        // Close modal after a short delay
        setTimeout(() => {
          setShowModal(false);
        }, 2000);
      } else {
        setTransactionError(response.data.message);
      }
    } catch (err) {
      console.error('Transaction error:', err);
      setTransactionError(err.response?.data?.error || 'Transaction failed. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><h3>Loading...</h3></div>;
  }

  return (
    <Container fluid>
      <Row className="py-3 bg-secondary text-white">
        <Col>
          <Container>
            <div className="d-flex justify-content-between align-items-center">
              <h2>Banking System - Banker Portal</h2>
              <div>
                <span className="me-3">Welcome, {user?.full_name}</span>
                <Button variant="light" size="sm" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </Container>
        </Col>
      </Row>
      
      <Container className="mt-4">
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-3">
          <Button variant="secondary" as={Link} to="/banker/dashboard">
            &larr; Back to Dashboard
          </Button>
        </div>

        {customerData && (
          <>
            <Card className="mb-4">
              <Card.Header>
                <h3>Customer Details</h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Name:</strong> {customerData.user.full_name}</p>
                    <p><strong>Username:</strong> {customerData.user.username}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Email:</strong> {customerData.user.email}</p>
                    <p><strong>Role:</strong> {customerData.user.role}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <h3>Customer Accounts</h3>
            <Row className="mb-4">
              {customerData.accounts.map(account => (
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
                          onClick={() => openTransactionModal('deposit', account)}
                        >
                          Deposit
                        </Button>
                        <Button 
                          variant="warning" 
                          onClick={() => openTransactionModal('withdraw', account)}
                        >
                          Withdraw
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              {customerData.accounts.length === 0 && (
                <Col>
                  <Alert variant="info">No accounts found for this customer.</Alert>
                </Col>
              )}
            </Row>

            <h3>Transaction History</h3>
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
                  {customerData.transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.created_at).toLocaleString()}</td>
                      <td>{transaction.account_id}</td>
                      <td>
                        <span className={transaction.type === 'deposit' ? 'text-success' : 'text-danger'}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </td>
                      <td>${parseFloat(transaction.amount).toFixed(2)}</td>
                      <td>${parseFloat(transaction.balance_before).toFixed(2)}</td>
                      <td>${parseFloat(transaction.balance_after).toFixed(2)}</td>
                    </tr>
                  ))}
                  {customerData.transactions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center">No transactions found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </Container>
      
      {/* Transaction Modal */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {transactionType === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentAccount && (
            <>
              <p>Account: {currentAccount.account_number}</p>
              <p>Available Balance: ${parseFloat(currentAccount.balance).toFixed(2)}</p>
              
              {transactionError && <Alert variant="danger">{transactionError}</Alert>}
              {transactionSuccess && <Alert variant="success">{transactionSuccess}</Alert>}
              
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
                    variant={transactionType === 'deposit' ? 'success' : 'warning'} 
                    type="submit"
                  >
                    {transactionType === 'deposit' ? 'Deposit' : 'Withdraw'}
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

export default BankerUserDetails;