import { Container, Card, Table, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import '../AdminComponents/AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState , useEffect } from 'react';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import '../AdminComponents/AdminTableList.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const AdminCreateTeacherAccount = () => {
    const [show, setShow] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: ''
    });
    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    
            try {
                const response = await fetch('/api/admin/users?role=teacher', { // Fetch only students
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Add the Bearer token here
                    },
                });
    
                if (response.ok) {
                    const json = await response.json();
                    setUsers(json); // Set the users if the response is successful
                } else {
                    console.error('Failed to fetch users:', response.status);
                }
            } catch (error) {
                console.error('Error fetching users:', error.message);
            }
        };
    
        fetchUsers();
    }, []);
    


    const handleClose = () => {
        setShow(false);
        setSelectedUserId(null);  // Reset selectedUserId when modal closes
    };

    const handleShow = (userId) => {
        setSelectedUserId(userId);  // Set the userId when showing modal
        setShow(true);
    };

    const deleteHandler = async (userId) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        console.log("Deleting user with ID:", userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}`, { // Corrected endpoint
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Ensure token is included
                }
            });
    
            console.log("Response status:", response.status);
            if (response.ok) {
                setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
                handleClose(); // Close the modal after deletion
            } else {
                const json = await response.json();
                console.error('Error response:', json);
                setError(json.message);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            setError('Failed to delete user');
        }
    };

    const handleAddUser = async (e) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        e.preventDefault();
        setLoading(true);
        setError('');
    
        const userData = {
            username: newUser.username,
            password: newUser.password,
            role: 'teacher' // Set role to 'teacher'
        };
    
        try {
            const response = await fetch('/api/admin/addUsers', {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });
    
            const json = await response.json();
    
            if (!response.ok) {
                throw new Error(json.message || 'Failed to add user');
            }
            
            // Directly update the users state with the new user data
            setUsers(prevUsers => [...prevUsers, json.data]); // Use json.data to get the new user object
    
            // Reset form and handle success
            setNewUser({ username: '', password: '', role: '' });
            setLoading(false);
            setShowAddModal(false);
            console.log('User added successfully');
        } catch (error) {
            setLoading(false);
            setError(error.message);
            console.error('Error adding user:', error);
        }
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
        <AdminSidebar/>
        <div className='d-flex'>
        <main className="main-content flex-grow-1">
        <Container fluid>
             {/* User Accounts Table */}
             <Card>
        <Card.Body>
            <Card.Title>User Accounts</Card.Title>
            
            {/* Table Controls */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                    <span>Show</span>
                    <Form.Select 
                        size="sm"
                        className="mx-2"
                        style={{ width: 'auto' }}
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

                <div>
                <button 
            className='btn btn-primary mx-5 px-3 custom-width-btn'
                    onClick={() => setShowAddModal(true)}
                >
                    Add Users
                </button>
                </div>

                <InputGroup style={{ width: '200px' }}>
                    <InputGroup.Text>
                        <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
            </div>
        
                     <Table responsive hover className='table-striped table-bordered text-center'>
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
                    <td>{user.createdAt}</td>
                    <td>{user.role}</td>
                    <td>
                        <button className='btn btn-primary custom-btn'>Edit</button>
                        <button 
                            className='btn btn-danger custom-btn' 
                            onClick={() => handleShow(user._id)}
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            ))}
    </tbody>
</Table>

            <div className="d-flex justify-content-between mt-3">
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange('prev')}
                                    >
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
                                    </Button>
                                </div> 


            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Add New User</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form onSubmit={handleAddUser}>
            <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                />
            </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Control
                            type="text"
                            value="Teacher" // Set the value to "Student"
                            readOnly // Make the field read-only
                            disabled // Optionally, you can also disable it
                        />
                    </Form.Group>

            <div className="text-center mt-3">
                <Button variant="secondary" onClick={() => setShowAddModal(false)} className="me-2">
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    Add User
                </Button>
            </div>
        </Form>
    </Modal.Body>
</Modal>

      <Modal show={show} onHide={handleClose} className='text-center'>
        <Modal.Header closeButton className='text-center'>
          <Modal.Title className='text-center w-100'>CONFIRMATION MESSAGE</Modal.Title>
        </Modal.Header>
        <Modal.Body>The data will be erased and cannot be retrieved. Are you sure you want to continue?</Modal.Body>
        <Modal.Footer className='justify-content-center'>
        <Button variant="primary" className="px-4" onClick={() => setShow(false)}>
            Cancel
          </Button>
      <Button 
            variant="danger" 
            className="px-4" 
            onClick={() => selectedUserId && deleteHandler(selectedUserId)}
        >
            Confirm
        </Button>
        </Modal.Footer>
      </Modal>
      
        </Card.Body>
        </Card>
        </Container>
        </main>
        </div>
            </>
     );
}
 
export default AdminCreateTeacherAccount;