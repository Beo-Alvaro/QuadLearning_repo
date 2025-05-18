import { Container, Card, Table, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import '../AdminComponents/AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState , useEffect } from 'react';
import '../AdminComponents/AdminTableList.css';
import Button from 'react-bootstrap/Button';
import AdminResetPasswordModal from '../AdminComponents/AdminResetPasswordModal';
import { useUsersDataContext } from '../hooks/useUsersDataContext';
import { ToastContainer } from 'react-toastify';

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

    // Add these after your existing state declarations
const [sortField, setSortField] = useState('username');
const [sortDirection, setSortDirection] = useState('asc');
const [roleFilter, setRoleFilter] = useState('all');

// Add this sorting function
const getSortedAccounts = (accounts) => {
    return [...accounts].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === 'createdAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else {
            aValue = aValue?.toLowerCase() || '';
            bValue = bValue?.toLowerCase() || '';
        }
        
        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
    });
};

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


// Replace your existing filteredAccounts const with this
const filteredAccounts = users
    ?.filter(user => 
        roleFilter === 'all' ? true : user.role.toLowerCase() === roleFilter
    )
    ?.filter(user => 
        user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.role?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

const sortedAndFilteredAccounts = getSortedAccounts(filteredAccounts);

    const totalPages = Math.ceil(filteredAccounts.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    
    return ( 
        <>
        <ToastContainer/>

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

                                <Form.Select
    size="md"
    className="mx-2"
    style={{ width: "200px" , height: "38px" }}
    value={roleFilter}
    onChange={(e) => setRoleFilter(e.target.value)}
>
    <option value="all">All Roles</option>
    <option value="student">Students</option>
    <option value="teacher">Teachers</option>
    <option value="admin">Admins</option>
</Form.Select>

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
        <th onClick={() => {
            setSortDirection(sortField === 'username' && sortDirection === 'asc' ? 'desc' : 'asc');
            setSortField('username');
        }} style={{ cursor: 'pointer' }}>
            Name {sortField === 'username' && (
                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
            )}
        </th>
        <th onClick={() => {
            setSortDirection(sortField === 'createdAt' && sortDirection === 'asc' ? 'desc' : 'asc');
            setSortField('createdAt');
        }} style={{ cursor: 'pointer' }}>
            Date Created {sortField === 'createdAt' && (
                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
            )}
        </th>
        <th onClick={() => {
            setSortDirection(sortField === 'role' && sortDirection === 'asc' ? 'desc' : 'asc');
            setSortField('role');
        }} style={{ cursor: 'pointer' }}>
            Role {sortField === 'role' && (
                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
            )}
        </th>
        <th>Actions</th>
    </tr>
</thead>
                                <tbody>
                                    {sortedAndFilteredAccounts
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
                                                            Reset Password
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