import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Alert, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BankerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load banker data, customer list and all accounts
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/banker/login');
          return;
        }

        const [userRes, customersRes, accountsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: token }
          }),
          axios.get('http://localhost:5000/api/users/all', {
            headers: { Authorization: token }
          }),
          axios.get('http://localhost:5000/api/accounts/all', {
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
        setCustomers(customersRes.data.users);
        setAccounts(accountsRes.data.accounts);
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/banker/login');
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

        <h3>Customer Accounts</h3>
        <div className="table-responsive mb-5">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.full_name}</td>
                  <td>{customer.username}</td>
                  <td>{customer.email}</td>
                  <td>
                    <Button 
                      variant="info" 
                      size="sm" 
                      as={Link} 
                      to={`/banker/users/${customer.id}`}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">No customers found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <h3>All Accounts</h3>
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Customer Name</th>
                <th>Balance</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr key={account.id}>
                  <td>{account.account_number}</td>
                  <td>{account.full_name}</td>
                  <td>${parseFloat(account.balance).toFixed(2)}</td>
                  <td>{new Date(account.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button 
                      variant="info" 
                      size="sm" 
                      as={Link} 
                      to={`/banker/users/${account.user_id}`}
                    >
                      View Customer
                    </Button>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">No accounts found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Container>
    </Container>
  );
};

export default BankerDashboard;