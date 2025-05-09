import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import './AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext'; 
import UserManagementModal from './UserManagementModal';

const AdminSidebar = () => {
    const [loading, setLoading] = useState(false); // Define loading state
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Define navigate
    const { user } = useAuth();
    const [showUserManagementModal, setShowUserManagementModal] = useState(false);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  
    const handleLogOut = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        try {
            const response = await fetch('/api/users/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
    
            if (!response.ok) {
                throw new Error('Logout failed');
            }
    
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
    
            // Redirect to login page and replace the current entry in the history stack
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message);
            console.error('Error during logout:', err.message);
        } finally {
            setLoading(false);
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
            <LinkContainer to="/admin/home">
                    <Nav.Link className="sidebar-link">
                        <i className="bi bi-house-door icon"></i> Home
                    </Nav.Link>
                </LinkContainer>

                <Nav.Link 
                className="sidebar-link" 
                onClick={() => setShowUserManagementModal(true)}
            >
                <i className="bi bi-people-fill icon"></i>
                Users Management
            </Nav.Link>

            {/* Simplified UserManagementModal */}
            <UserManagementModal 
                show={showUserManagementModal}
                handleClose={() => setShowUserManagementModal(false)}
            />
                <LinkContainer to="/admin/messages">
                    <Nav.Link className="sidebar-link">
                        <i className="bi bi-person-badge-fill"></i> <span className='ps-2'>Messages </span>
                    </Nav.Link>
                </LinkContainer>

                {/* Academic Management Dropdown */}
                <div className="sidebar-dropdown">
                    <div className="sidebar-link" onClick={() => toggleDropdown('academic')}>
                    <i className="bi bi-diagram-3"></i>
                        <span>Academic Management</span>
                        <i className={`bi bi-chevron-${dropdowns.academic ? 'up' : 'down'} ms-auto`}></i>
                    </div>
                    <div className={`sidebar-dropdown-content ${dropdowns.academic ? 'show' : ''}`}>
                    <LinkContainer to="/admin/strands">
                            <Nav.Link>Manage Strands</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/sections">
                            <Nav.Link>Manage Sections</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/subjects">
                            <Nav.Link>Manage Subjects</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/semesters">
                            <Nav.Link>Manage Semesters</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/pendingstudents">
                            <Nav.Link>Pending Students</Nav.Link>
                        </LinkContainer>
                    </div>
                </div>

                <UserManagementModal 
                show={showUserManagementModal}
                handleClose={() => setShowUserManagementModal(false)}
                setShowAddStudentModal={setShowAddStudentModal}
                setShowAddTeacherModal={setShowAddTeacherModal}
            />
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