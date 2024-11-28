import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import { FaSearch } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';

const ManageSemesters = () => {
    const navigate = useNavigate();
    const [semesters, setSemesters] = useState([]);
    const [selectedSemesterId, setselectedSemesterId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [show, setShow] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editModalShow, setEditModalShow] = useState(false);
    // Reusable fetchSemesters function
    const fetchSemesters = async () => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        try {
            const response = await fetch('/api/admin/getSemesters', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Add the Bearer token here
                },
            });

            if (response.ok) {
                const json = await response.json();
                setSemesters(json); // Set the data if the response is successful
            } else {
                console.error('Failed to fetch semesters:', response.status);
            }
        } catch (error) {
            console.error('Error fetching semesters:', error.message);
        }
    };

    // Fetch semesters when the component mounts
    useEffect(() => {
        fetchSemesters();
    }, []);

    const handleSubmit = async (e) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        e.preventDefault();
        setLoading(true);
        setError('');
    
        // Check if both startDate and endDate are not empty
        if (!startDate || !endDate) {
            setError('Both start date and end date are required.');
            setLoading(false);
            return;
        }
    
        // Convert the string dates into Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        // Check if the Date objects are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            setError('Invalid date format');
            setLoading(false);
            return;
        }
    
        // Create the semester data with ISO format for date
        const semesterData = {
            name,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        };
    
        try {
            const response = await fetch('/api/admin/addSemesters', {
                method: 'POST',
                body: JSON.stringify(semesterData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const json = await response.json();
    
            if (!response.ok) {
                setError(json.message || 'Failed to create semester');
            } else {
                setName('');
                setStartDate('');
                setEndDate('');
                fetchSemesters();
                console.log('Semester created successfully');
                // Optionally, fetch updated semesters or redirect
            }
        } catch (error) {
            setError('An error occurred while creating the semester');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
        fetchSemesters();
    };

    
    const handleClose = () => {
        setShow(false);
        setselectedSemesterId(null);
    };
    

    const handleShow = (semesterId) => {
        setselectedSemesterId(semesterId);  // Set the userId when showing modal
        setShow(true);
    };

    const handleEditShow = (semesterId) => {
        const semester = semesters.find((semester) => semester._id === semesterId);
        if (semester) {
            setselectedSemesterId(semesterId);
            setName(semester.name);
            setStartDate(semester.startDate);
            setEndDate(semester.endDate);
    
            setEditModalShow(true);
        } else {
            console.error('Section not found');
        }
    };
    
    const handleCloseModal = () => {
        setEditModalShow(false);
        setselectedSemesterId(null);
        setName('');
        setStartDate('');
        setEndDate('');
        // Don't reset studSections unless necessary.
    };
    
    
    const deleteHandler = async (semesterId) => {
        const token = localStorage.getItem('token'); // Retrieve token
        try {
            const response = await fetch(`/api/admin/semesters/${semesterId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (response.ok) {
                // Update semesters list
                setSemesters(prevSemesters => prevSemesters.filter(semester => semester._id !== semesterId));
                
                // Close the modal
                handleClose();
            } else {
                const error = await response.json();  // Log the error message from backend
                console.error('Error deleting semester:', error.message);
            }
        } catch (error) {
            console.error('Error deleting semester:', error.message);
        }
    };
    
    

    // Filtering and Pagination
    const filteredSemesters = semesters.filter((semester) =>
        semester.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredSemesters.slice(indexOfFirstEntry, indexOfLastEntry);

    const totalPages = Math.ceil(filteredSemesters.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleSaveChanges = async () => {
        
        const updatedSection = {
            name,
            startDate: startDate, // This could be the value selected from the dropdown
            endDate: endDate, // Pass the selected subjects 
        };
    
        const token = localStorage.getItem('token');
    
        try {
            const response = await fetch(`/api/admin/semesters/${selectedSemesterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedSection),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                // Successfully updated the semester
                setSemesters((prevSemesters) =>
                    prevSemesters.map((semester) =>
                        semester._id === selectedSemesterId ? result : semester // Use `semester` instead of `section`
                    )
                );
                handleCloseModal(); // Close modal after saving
            } else {
                console.error('Error updating strand:', result.message);
            }
        } catch (error) {
            console.error('Failed to update strand:', error);
        }
        fetchSemesters(); // Refresh the data
    };
    

    return (
        <>
            <AdminSidebar />
            <div className="d-flex">
                <main className="main-content flex-grow-1">
                    <Container>
                        <Card className="mt-4">
                            <Card.Header>
                                <h4 className="mb-0">Create New Semester</h4>
                            </Card.Header>
                            <Card.Body>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Semester Term</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Semester</option>
                                            <option value="1st Semester">1st Semester</option>
                                            <option value="2nd Semester">2nd Semester</option>
                                            <option value="Summer Term">Summer Term</option>
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => navigate('/admin/ManageSemesters')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating...' : 'Create Semester'}
                                        </Button>
                                    </div>
                                </Form>

                                <h2 className="my-4">Semesters List</h2>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    {/* Entries Dropdown */}
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

                                    {/* Search Bar */}
                                    <InputGroup style={{ width: '300px' }}>
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

                                <Table striped bordered hover>
                                    <thead className='text-center'>
                                        <tr>
                                            <th>Term</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-center'> 
                                        {currentEntries.length > 0 ? (
                                            currentEntries.map((semester) => (
                                                <tr key={semester._id}>
                                                    <td>{semester.name}</td>
                                                    <td>{new Date(semester.startDate).toLocaleDateString()}</td>
                                                    <td>{new Date(semester.endDate).toLocaleDateString()}</td>
                                                    <td>
                                                    <div className="button-group">
                                                    <button
                                             className="btn btn-primary custom-btn"
                                                onClick={() => handleEditShow(semester._id)}
                                             >
                                                  Edit
                                        </button>
                                             <button
                                            className="btn btn-danger custom-btn"
                                            onClick={() => handleShow(semester._id)}
                                        >
                                             Delete
                                         </button>
                                         </div>
                                                    </td>
                                                    
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No results found</td>
                                            </tr>
                                        )}
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
                            </Card.Body>
                        </Card>
                    </Container>
                </main>
            </div>
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
            onClick={() => selectedSemesterId && deleteHandler(selectedSemesterId)}
        >
            Confirm
        </Button>
        </Modal.Footer>
      </Modal>
       {/* Edit Modal */}
       <Modal show={editModalShow} onHide={handleCloseModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Semester</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Semester Name</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        >
                                            <option value="">Select Semester</option>
                                            <option value="1st Semester">1st Semester</option>
                                            <option value="2nd Semester">2nd Semester</option>
                                            <option value="Summer Term">Summer Term</option>
                                        </Form.Control>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseModal}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSaveChanges}
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Semester'}
                                </Button>
                            </Modal.Footer>
                        </Modal>
        </>
    );
};

export default ManageSemesters;
