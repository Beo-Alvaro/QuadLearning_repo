import { Navbar, Nav, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
function StudentDashboardNavbar() {
  const [loading, setLoading] = useState(false); // Define loading state
  const [error, setError] = useState('');
  const [userName, setUserName] = useState(''); // State for username
  const navigate = useNavigate(); // Define navigate
  const { logout, user } = useAuth();

  useEffect(() => {
    // Retrieve user info from localStorage when the component mounts
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserName(user.username); // Assuming the user object has a 'username' field
    }
  }, []); // Empty dependency array to run only once on mount

  const handleLogOut = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await logout(); // Use the logout function from auth context
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      console.error('Error during logout:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar expand="lg" className="bg-success text-white shadow-sm navbar-green">
        <Container>
        <Navbar.Brand>
              <img
                alt=""
                src="/img/TVNHS.png"
                width="40"
                height="40"
                className="d-inline-block align-top"
              />{' '}
            </Navbar.Brand>
    <Navbar.Brand className="text-white me-4">TVNHS</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mx-auto">
      <Nav.Link as={Link} className="mx-3 text-white" to="/student/home">Home</Nav.Link>
      <Nav.Link as={Link} className="mx-3 text-white" to="/student/profile">Profile</Nav.Link>
      <Nav.Link as={Link} className="mx-3 text-white" to="/student/grades">Grades</Nav.Link>
      <Nav.Link as={Link} className="mx-3 text-white" to="/student/messages">Contact Admin</Nav.Link>
    </Nav>
            <Nav>
            <Nav.Link 
              onClick={handleLogOut} 
              disabled={loading} 
              className='btn btn-success text-white'
            >
              {loading ? 'Logging out...' : 'Log Out'}
            </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
          </>
  );
}

export default StudentDashboardNavbar;