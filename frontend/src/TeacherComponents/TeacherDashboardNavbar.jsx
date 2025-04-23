import { Navbar, Nav, Button, Container, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { Table, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';
function TeacherDashboardNavbar() {


  const [loading, setLoading] = useState(false); // Define loading state
  const [error, setError] = useState('');
  const [userName, setUserName] = useState(''); // State for username
  const navigate = useNavigate(); // Define navigate
  const API_URL = import.meta.env.VITE_API_URL || '/api';


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
        const response = await fetch(`${API_URL}/users/logout`, {
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
    <Navbar.Brand href="/login/TeacherScreens/TeacherHomeScreen" className="text-white me-4">TVNHS</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="mx-auto">
        <Nav.Link className="mx-3 text-white" href="/login/TeacherScreens/TeacherHomeScreen">Home</Nav.Link>
        <Nav.Link className="mx-3 text-white" href="/login/TeacherScreens/TeacherViewStudents">View Students</Nav.Link>
        <Nav.Link className="mx-3 text-white" href="/login/TeacherScreens/TeacherEncodeGrade">Encode Grades</Nav.Link>
        <Nav.Link className="mx-3 text-white" href="/login/TeacherScreens/TeacherAttendance">Attendance</Nav.Link>
        <Nav.Link className="mx-3 text-white" href="/login/TeacherScreens/TeacherGenerateForm">Generate Form</Nav.Link>
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

export default TeacherDashboardNavbar;