import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiConfig from '../config/apiConfig';

const Header = () => {
  const [loading, setLoading] = useState(false); // Define loading state
  const [error, setError] = useState('');
  const [userName, setUserName] = useState(''); // State for username
  const navigate = useNavigate(); // Define navigate


  useEffect(() => {
    // Retrieve user info from localStorage when the component mounts
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserName(user.username); // Assuming the user object has a 'username' field
    }
  }, []); // Empty dependency array to run only once on mount


  const logoutHandler = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const baseUrl = apiConfig.getBaseUrl();
      const response = await fetch(`${baseUrl}/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove token and user info from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('sections');

      // Navigate to login page
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };




  return (
    <header>
      <Navbar bg='success' variant='dark' expand='lg' collapseOnSelect>
        <Container>
            <Navbar.Brand>
              <img
                alt=""
                src="/img/TVNHS.png"
                width="30"
                height="30"
                className="d-inline-block align-top"
              />{' '}
              TVNHS
            </Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              {userName ? ( // Conditional rendering based on userName
                <Nav.Link disabled style={{ color: 'white' }}> {/* Change 'white' to your desired color */}
                  Welcome back, {userName}
                </Nav.Link>
              ) : (
                <LinkContainer to='/login'>
                  <Nav.Link>
                    <FaSignInAlt /> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}
              <button onClick={logoutHandler} disabled={loading} className='btn btn-success'>
                {loading ? 'Logging out...' : 'Log Out'}
              </button>
              {error && <div className="alert alert-danger">{error}</div>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;