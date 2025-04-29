import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const BankerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { username, password } = formData;

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'banker') {
      navigate('/banker/dashboard');
    } else if (token && userRole === 'customer') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/users/login`, {
        username,
        password
      });

      if (response.data.success && response.data.user) {
        const { access_token, role } = response.data.user;

        if (role !== 'banker') {
          setError('Access denied. This login is for bankers only.');
          setLoading(false);
          return;
        }

        // Save the token and role
        localStorage.setItem('token', access_token);
        localStorage.setItem('userRole', role);

        // Redirect to banker dashboard
        navigate('/banker/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-lg border-0 rounded-lg">
            <Card.Header className="bg-secondary text-white text-center">
              <h3>Banker Login</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Username or Email</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Enter username or email"
                    value={username}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

                <Button
                  variant="secondary"
                  type="submit"
                  className="w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login as Banker'}
                </Button>
              </Form>
              <div className="text-center mt-4">
                <Link to="/login">Customer Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BankerLogin;