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


  const handleLogOut = async (e) => {
    e.preventDefault(); // Prevent the default behavior of the event
    setLoading(true);   // Set loading state to true
    setError('');       // Clear any previous errors

    try {
      const baseUrl = apiConfig.getBaseUrl();
      const response = await fetch(`${baseUrl}/users/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies in the request if they're used for authentication
        });

        if (!response.ok) {
            throw new Error('Logout failed');
        }

        // Clear token and user info from local storage
        localStorage.removeItem('token'); // Clear token if stored locally
        localStorage.removeItem('userInfo'); // Remove additional user data if stored

        // Redirect to the login page
        navigate('/login');
        console.log('Logout successful');
    } catch (err) {
        setError(err.message); // Display error message in the UI
        console.error('Error during logout:', err.message); // Log the error for debugging
    } finally {
        setLoading(false); // Reset the loading state
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
              <button onClick={handleLogOut} disabled={loading} className='btn btn-success'>
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