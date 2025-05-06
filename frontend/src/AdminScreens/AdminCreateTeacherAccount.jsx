import { Container, Card, Table, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import '../AdminComponents/AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState, useEffect } from 'react';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import '../AdminComponents/AdminTableList.css';
import Header from '../components/Header';
import { useTeacherDataContext } from '../hooks/useTeacherDataContext';
import AdminTeacherModals from '../AdminComponents/CreatingTeacherComponents/AdminTeacherModals';
import AdminTeacherTable from '../AdminComponents/CreatingTeacherComponents/AdminTeacherTable';
import { ToastContainer, toast } from 'react-toastify';
import apiConfig from '../config/apiConfig';

const AdminCreateTeacherAccount = () => {
    const { teacherUsers, sections, semesters, advisorySections, loading, dispatch, fetchData} = useTeacherDataContext()
    const [users, setUsers] = useState()
    const [error, setError] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: 'teacher',
        sections: [],
        subjects: [],
        semesters: [],
        advisorySection: '' // Add this field
    });

        
    const resetForm = () => {
        setNewUser({
            username: '',
            password: '',
            role: 'teacher',
            sections: [],
            subjects: [],
            semesters: [],
            advisorySection: ''
        });
    };


    const handleClose = () => {
        setShowAddModal(false)
        setShowDeleteModal(false);
        setShowEditModal(false);
        setSelectedUserId(null);
        resetForm();
    };
    

   const handleShow = (userId) => {
    if (!userId) {
        console.error("Invalid userId:", userId);
        return; 
    }
    console.log("User ID passed to deleteHandler:", userId); // Check if it passes correctly here
    setSelectedUserId(userId); // Set the user ID for deletion
    setShowDeleteModal(true); // Show the modal after initiating the delete
    toast.warn('Are you sure you want to delete this user? This action is permanent and cannot be undone.')
};

const deleteHandler = async (userId) => {
    console.log("Deleting user with ID:", userId);  // Log userId to make sure it's valid
    if (!userId) {
        console.error("Invalid userId:", userId);
        return;
    }
    const token = localStorage.getItem('token');
    try {
        const baseUrl = apiConfig.getBaseUrl();
        const response = await fetch(`${baseUrl}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        console.log("Response status:", response.status);
        if (response.ok) {
            // Ensure the deletion is complete before updating the state
            const updatedTeachersRes = await fetch(`${baseUrl}/admin/users?role=teacher`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedTeachers = await updatedTeachersRes.json();

            // Dispatch the updated list of teachers to the context
            dispatch({ type: 'SET_DATA', payload: { teacherUsers: updatedTeachers } });
            handleClose(); // Close modal after successful deletion
            toast.error('Teacher deleted successfully!')
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
   // Update handleAddUser to properly handle the advisory section
const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!newUser.username || !newUser.password || !newUser.sections.length || 
        !newUser.subjects.length || !newUser.semesters.length) {
        setError('Please fill in all required fields');
        return;
    }

    const userData = {
        username: newUser.username.trim(),
        password: newUser.password,
        role: 'teacher',
        sections: newUser.sections.map(id => id.toString()),
        subjects: newUser.subjects.map(id => id.toString()),
        semesters: newUser.semesters.map(id => id.toString()),
        advisorySection: newUser.advisorySection 
        ? { section: newUser.advisorySection.toString() }
        : null
    };

    console.log('Sending user data:', userData); // Debug log
    console.log('Advisory Section:', newUser.advisorySection);

    try {
        const token = localStorage.getItem('token');
        const baseUrl = apiConfig.getBaseUrl();
        const response = await fetch(`${baseUrl}/admin/addUsers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create teacher account');
        }

        // Fetch the updated list of teachers
        const baseUrl2 = apiConfig.getBaseUrl();
        const updatedTeachersRes = await fetch(`${baseUrl2}/admin/users?role=teacher`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const updatedTeachers = await updatedTeachersRes.json();

        // Dispatch the updated list of teachers to the context
        dispatch({ type: 'SET_DATA', payload: { teacherUsers: updatedTeachers } });

        setShowAddModal(false);
        resetForm();
        toast.success('Teacher created successfully!')

    } catch (error) {
        console.error('Error creating teacher:', error);
        setError(error.message || 'Failed to create teacher account');
    }
};

    const handleEditShow = async (user) => {
        console.log('Editing user:', user); // Debug log
        
        // Set the initial values
        const initialEditUser = {
            id: user._id,
            sections: user.sections?.map(section => section._id) || [],
            subjects: user.subjects?.map(subject => subject._id) || [],
            semesters: user.semesters?.map(semester => semester._id) || [],
            advisorySection: user.advisorySection?._id || ''
        };
        
        setEditUser(initialEditUser);
        
        // Trigger subject filtering immediately
        try {
            const token = localStorage.getItem('token');
            const baseUrl = apiConfig.getBaseUrl();
            const response = await fetch(`${baseUrl}/admin/subjects/filter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    sections: initialEditUser.sections,
                    semesters: initialEditUser.semesters
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch filtered subjects');
            }
    
            const filteredSubjects = await response.json();
            setAvailableSubjects(filteredSubjects || []);
        } catch (error) {
            console.error('Error fetching filtered subjects:', error);
            setAvailableSubjects([]);
        }
        
        setShowEditModal(true);
    };

// Update the editUser state
const [editUser, setEditUser] = useState({
    id: '',
    sections: [],
    subjects: [],
    semesters: [],
    advisorySection: ''
});
    
    const handleEditClose = () => {
        setShowEditModal(false);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError('');
    
        try {
            // Format the data to match what the backend expects
            const userData = {
                sections: editUser.sections,
                subjects: editUser.subjects,
                semesters: editUser.semesters,
                advisorySection: editUser.advisorySection 
                ? { section: editUser.advisorySection.toString() }
                : null
            };
    
            console.log('Sending update request:', userData);
            
            const token = localStorage.getItem('token');
            const baseUrl = apiConfig.getBaseUrl();
            const response = await fetch(`${baseUrl}/admin/users/${editUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            });
    
            const data = await response.json();
            console.log('Response data:', data);
    
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user');
            }
    
            // Re-fetch the updated list of teachers
            const baseUrl2 = apiConfig.getBaseUrl();
            const updatedTeachersRes = await fetch(`${baseUrl2}/admin/users?role=teacher`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const updatedTeachers = await updatedTeachersRes.json();
    
            // Dispatch the updated list of teachers to the context
            dispatch({ type: 'SET_DATA', payload: { teacherUsers: updatedTeachers } });
    
            // Close the modal and reset the form
            handleEditClose();
            toast.success('Teacher updated successfully!')
        } catch (error) {
            setError(error.message);
            console.error('Update error:', error);
        }
    };

    const filteredUsers = teacherUsers?.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []; // Default to an empty array if teacherUsers is undefined
    
    const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    
    // Check if the data exists before rendering
    {filteredUsers?.length > 0 && (
        <AdminTeacherTable
            filteredUsers={filteredUsers}
            showEditModal={handleEditShow}
            handleShow={handleShow}
            currentPage={currentPage}
            entriesPerPage={entriesPerPage}
            handlePageChange={handlePageChange}
            totalPages={totalPages}
        />
    )}
    
    useEffect(() => {
        fetchData();
      }, []); 

    useEffect(() => {
        const filterSubjects = async () => {
            const activeUser = showAddModal ? newUser : editUser;
            
            // Check if both arrays exist and have length
            if (activeUser?.sections?.length > 0 && activeUser?.semesters?.length > 0) {
                try {
                    const token = localStorage.getItem('token');
                    const baseUrl = apiConfig.getBaseUrl();
                    const response = await fetch(`${baseUrl}/admin/subjects/filter`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            sections: activeUser.sections,
                            semesters: activeUser.semesters
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch filtered subjects');
                    }

                    const filteredSubjects = await response.json();
                    console.log('Filtered subjects:', filteredSubjects); // Debug log
                    setAvailableSubjects(filteredSubjects || []); // Ensure it's always an array
                } catch (error) {
                    console.error('Error filtering subjects:', error);
                    setAvailableSubjects([]);
                }
            } else {
                setAvailableSubjects([]);
            }
        };

        filterSubjects();
    }, [
        newUser.sections, 
        newUser.semesters,
        editUser.sections,
        editUser.semesters,
        showAddModal
    ]); 
    return (
        <>
        <Header/>
            <AdminSidebar />
            <ToastContainer />
            <div className='d-flex'>
                <main className="main-content flex-grow-1">
                    <Container fluid>
                        <Card>
                            <Card.Body>
                                <Card.Title>Teacher Accounts</Card.Title>
                                
                                {/* Search and Add User controls */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <InputGroup style={{ width: "300px" }}>
                                        <InputGroup.Text>
                                            <FaSearch />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                    <button 
        className='btn btn-outline-success mx-2 px-10'
        style={{ width: '150px' }} // Fixed width of 150 pixels
        size="sm" 
        onClick={() => setShowAddModal(true)}
    >
        Add Users
    </button>
                                </div>

                        {/* Teachers Table */}
                        <AdminTeacherTable 
                        filteredUsers={filteredUsers}
                        showEditModal={handleEditShow} // Pass the function that handles showing the modal
                        handleShow={handleShow}
                        currentPage={currentPage}
                        entriesPerPage={entriesPerPage}
                        handlePageChange={handlePageChange}
                        totalPages={totalPages}
                    />
                                <AdminTeacherModals 
                                showAddModal={showAddModal}
                                setShowAddModal={setShowAddModal}
                                showEditModal={showEditModal}
                                setShowEditModal={setShowEditModal}
                                showDeleteModal={showDeleteModal}
                                setShowDeleteModal={setShowDeleteModal}
                                newUser={newUser}
                                setNewUser={setNewUser}
                                editUser={editUser}
                                setEditUser={setEditUser}
                                availableSubjects={availableSubjects}
                                sections={sections}
                                semesters={semesters}
                                advisorySections={advisorySections}
                                loading={loading}
                                error={error}
                                handleAddUser={handleAddUser}
                                handleEditSubmit={handleEditSubmit}
                                handleEditClose={handleEditClose}
                                deleteHandler={deleteHandler}
                                selectedUserId={selectedUserId} 
                                handleClose={handleClose}
                                />
                            </Card.Body>
                        </Card>
                    </Container>
                </main>
            </div>
        </>
    );
}

export default AdminCreateTeacherAccount;