import { Container, Card, Table, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import '../AdminComponents/AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState , useEffect } from 'react';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import '../AdminComponents/AdminTableList.css';
import Button from 'react-bootstrap/Button';
import Header from '../components/Header';
import AdminResetPasswordModal from '../AdminComponents/AdminResetPasswordModal';
import { useUsersDataContext } from '../hooks/useUsersDataContext';
import {toast, ToastContainer} from 'react-toastify';

const AdminViewAllUsersScreen = () => {
    const { users, handleResetPassword, fetchUsers  } = useUsersDataContext();
    const [show, setShow] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const SEARCH_MAX_LENGTH = 50;

    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: ''
    });

    

    // Add this helper function
const getRoleBadgeColor = (role) => {
    switch (role.toLowerCase()) {
        case 'admin':
            return 'danger';
        case 'teacher':
            return 'success';
        case 'student':
            return 'info';
        default:
            return 'secondary';
    }
};

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleClose = () => {
        setShow(false);
        setSelectedUserId(null);  // Reset selectedUserId when modal closes
    };

    const handleShow = (userId) => {
        setSelectedUserId(userId);  // Set the userId when showing modal
        setShow(true);
        console.log(userId)
    };


    const filteredAccounts = users?.filter(user => 
        user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.role?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const totalPages = Math.ceil(filteredAccounts.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    
    return ( 
        <>
        <Header/>
        <ToastContainer/>
        <AdminSidebar/>
        <div className='d-flex'>
            <main className="main-content flex-grow-1">
                <Container fluid>
                    <Card className="table-container">
                        <Card.Body>
                            <Card.Title className="mb-4">User Accounts</Card.Title>
                            
                            {/* Table Controls */}
                            <div className="table-controls">
                                <div className="d-flex align-items-center">
                                    <span>Show</span>
                                    <Form.Select 
                                        size="sm"
                                        className="entries-select mx-2"
                                        value={entriesPerPage}
                                        onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </Form.Select>
                                    <span>entries</span>
                                </div>

                                        <InputGroup style={{ width: "700px" }}>
                                            <InputGroup.Text>
                                                <FaSearch />
                                            </InputGroup.Text>
                                            <Form.Control
                                                placeholder="Search for a user (e.g., John Doe or 1234567)"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                maxLength={SEARCH_MAX_LENGTH}
                                            />
                                        </InputGroup>
                            </div>
                        
                            <Table responsive hover className='custom-table text-center align-middle'>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Date Created</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAccounts
                                        .slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
                                        .map(user => (
                                            <tr key={user._id}>
                                                <td>{user.username || user.name}</td>
                                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className='text-capitalize text-white'>
                                                    <span className={`status-badge bg-${getRoleBadgeColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <Button 
                                                            variant="outline-success" 
                                                            size="sm" 
                                                            className="btn-action"
                                                            onClick={() => handleShow(user._id)}
                                                        >
                                                            <i className="bi bi-pencil-square me-1"></i>
                                                            Edit
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </Table>

                            <div className="pagination-container">
                                <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange('prev')}
                                >
                                    <i className="bi bi-chevron-left me-1"></i>
                                    Previous
                                </Button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange('next')}
                                >
                                    Next
                                    <i className="bi bi-chevron-right ms-1"></i>
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </main>
        </div>

        <AdminResetPasswordModal 
      show={show} 
      setShow={setShow}
      handleClose={handleClose} 
      selectedUserId={selectedUserId}
      setSelectedUserId={setSelectedUserId}
    />
            </>
     );
}
 
export default AdminViewAllUsersScreen;