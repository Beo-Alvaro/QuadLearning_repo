import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import './AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext'; 

const AdminSidebar = () => {
    const [loading, setLoading] = useState(false); // Define loading state
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Define navigate
    const { user } = useAuth();
  
    const handleLogOut = async (e) => {
        e.preventDefault(); // Prevent the default behavior of the event
        setLoading(true);   // Set loading state to true
        setError('');       // Clear any previous errors
    
        try {
            const response = await fetch('/api/users/logout', {
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

    const [dropdowns, setDropdowns] = useState({
        users: false,
        academic: false,
        settings: false
    });

    const toggleDropdown = (key) => {
        setDropdowns(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (

        <div className="sidebar">
            <div className="sidebar-header">
                <h3>Admin Panel</h3>
            </div>

            <Nav className="flex-column flex-grow-1">
                <LinkContainer to="/admin">
                    <Nav.Link className="sidebar-link">
                        <i className="bi bi-house-door icon"></i> Home
                    </Nav.Link>
                </LinkContainer>

<div className="sidebar-dropdown">
    <div className="sidebar-link" onClick={() => toggleDropdown('users')}>
        <i className="bi bi-people-fill"></i>
        <span>Users Management</span>
        <i className={`bi bi-chevron-${dropdowns.users ? 'up' : 'down'} ms-auto`}></i>
    </div>
    <div className={`sidebar-dropdown-content ${dropdowns.users ? 'show' : ''}`}>
        <LinkContainer to="/admin/AdminViewAllUsersScreen">
            <Nav.Link>
                <i className="bi bi-person-lines-fill"></i>
                View All Users
            </Nav.Link>
        </LinkContainer>
        <LinkContainer to="/admin/AdminCreateStudentAccount">
            <Nav.Link>
                <i className="bi bi-person-plus-fill"></i>
                Add Student Account
            </Nav.Link>
        </LinkContainer>
        <LinkContainer to="/admin/AdminPendingStudents">
            <Nav.Link>
                <i className="bi bi-person-badge-fill"></i>
                Pending Students
            </Nav.Link>
        </LinkContainer>
        <LinkContainer to="/admin/AdminCreateTeacherAccount">
            <Nav.Link>
                <i className="bi bi-person-badge-fill"></i>
                Add Teacher Account
            </Nav.Link>
        </LinkContainer>
        <LinkContainer to="/admin/AdminMessages">
            <Nav.Link>
                <i className="bi bi-person-badge-fill"></i>
                Messages
            </Nav.Link>
        </LinkContainer>
    </div>
</div>

                {/* Academic Management Dropdown */}
                <div className="sidebar-dropdown">
                    <div className="sidebar-link" onClick={() => toggleDropdown('academic')}>
                    <i className="bi bi-diagram-3"></i>
                        <span>Academic Management</span>
                        <i className={`bi bi-chevron-${dropdowns.academic ? 'up' : 'down'} ms-auto`}></i>
                    </div>
                    <div className={`sidebar-dropdown-content ${dropdowns.academic ? 'show' : ''}`}>
                        <LinkContainer to="/admin/strands">
                        <Nav.Link as={Link} to="/admin/strands">
                            Manage Strands
                        </Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/ManageSections">
                            <Nav.Link>Manage Sections</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/ManageSubjects">
                            <Nav.Link>Manage Subjects</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/ManageSemesters">
                            <Nav.Link>Manage Semesters</Nav.Link>
                        </LinkContainer>
                    </div>
                </div>

                     {/* Logout Link */}
                     <div className="sidebar-footer">
                    <div className="logout-link">
                        <Nav.Link onClick={handleLogOut} className="sidebar-link">
                            <i className="bi bi-box-arrow-right icon"></i>
                            <span>Logout</span>
                        </Nav.Link>
                    </div>
                </div>
            </Nav>
        </div>
    );
}

export default AdminSidebar;