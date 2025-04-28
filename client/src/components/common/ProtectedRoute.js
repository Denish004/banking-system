import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, userRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Use explicit token in header instead of defaults
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: token
          }
        });
        
        if (response.data.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      } finally {
        setLoading(false);
      }
    };
    
    verifyAuth();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><h3>Loading...</h3></div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={userRole === 'banker' ? '/banker/login' : '/login'} />;
  }
  
  // Check if user has correct role
  if (user && user.role !== userRole) {
    return <Navigate to={user.role === 'banker' ? '/banker/dashboard' : '/dashboard'} />;
  }
  
  return children;
};

export default ProtectedRoute;