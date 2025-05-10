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
import { apiRequest } from '../utils/api';

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

    const SEARCH_MAX_LENGTH = 30;
        
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

    // Add these state declarations after your existing useState declarations
    const [validations, setValidations] = useState({
        minLength: false,
        hasUppercase: false,
        hasNumber: false,
        hasSymbol: false
    });

    // Add password validation object
    const passwordValidation = {
        minLength: (password) => password.length >= 8,
        hasUppercase: (password) => /[A-Z]/.test(password),
        hasNumber: (password) => /[0-9]/.test(password),
        hasSymbol: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    // Add useEffect for password validation
    useEffect(() => {
        setValidations({
            minLength: passwordValidation.minLength(newUser.password),
            hasUppercase: passwordValidation.hasUppercase(newUser.password),
            hasNumber: passwordValidation.hasNumber(newUser.password),
            hasSymbol: passwordValidation.hasSymbol(newUser.password)
        });
    }, [newUser.password]);


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
        await apiRequest(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        // Ensure the deletion is complete before updating the state
        const updatedTeachers = await apiRequest('/api/admin/users?role=teacher', {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Dispatch the updated list of teachers to the context
        dispatch({ type: 'SET_DATA', payload: { teacherUsers: updatedTeachers } });
        handleClose(); // Close modal after successful deletion
        toast.error('Teacher deleted successfully!')
    } catch (error) {
        console.error('Error deleting user:', error);
        setError(error.message || 'Failed to delete user');
    }
};
   // Update handleAddUser to properly handle the advisory section
const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');

    // Check if all password requirements are met
    const isPasswordValid = Object.values(validations).every(v => v);
    
    if (!isPasswordValid) {
        toast.error('Password is not strong enough. Please meet all requirements.');
        return;
    }

    // Rest of your existing validation
    if (!newUser.username || !newUser.password || !newUser.sections.length || 
        !newUser.subjects.length || !newUser.semesters.length) {
        toast.error('Please fill in all required fields');
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
        const data = await apiRequest('/api/admin/addUsers', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData)
        });

        // Fetch the updated list of teachers
        const updatedTeachers = await apiRequest('/api/admin/users?role=teacher', {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Dispatch the updated list of teachers to the context
        dispatch({ type: 'SET_DATA', payload: { teacherUsers: updatedTeachers } });
        
        // Reset the form and close the modal
        resetForm();
        handleClose();
        toast.success('Teacher account created successfully!');
    } catch (error) {
        console.error('Error creating teacher account:', error);
        
        // Check for specific error cases
        if (error.message && error.message.includes('Username already exists')) {
            toast.error('This username is already taken!');
        } else {
            toast.error(error.message || 'Failed to create teacher account');
            setError(error.message || 'Failed to create teacher account');
        }
    }
};

    const handleEditShow = async (user) => {
        setSelectedUserId(user._id);
        
        // Populate form with the selected user's data
        const initialEditData = {
            username: user.username,
            password: '', // Usually don't populate existing passwords
            role: 'teacher',
            sections: user.sections?.map(section => section._id) || [],
            subjects: user.subjects?.map(subject => subject._id) || [],
            semesters: user.semesters?.map(semester => semester._id) || [],
            advisorySection: user.advisorySection?.section?._id || ''
        };
        
        setNewUser(initialEditData);
        
        // Fetch available subjects for the selected sections
        try {
            const token = localStorage.getItem('token');
            const subjectData = await apiRequest('/api/admin/subjects/filter', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    sections: initialEditData.sections,
                    yearLevels: [] // Keep this to maintain API compatibility
                })
            });
            
            setAvailableSubjects(subjectData || []);
            setShowEditModal(true);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            toast.error('Failed to load subject data. Please try again.');
        }
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
        
        // Skip password validation if they didn't change it
        if (newUser.password) {
            const isPasswordValid = Object.values(validations).every(v => v);
            if (!isPasswordValid) {
                toast.error('Password is not strong enough. Please meet all requirements.');
                return;
            }
        }
        
        // Validation
        if (!newUser.username || !newUser.sections.length || 
            !newUser.subjects.length || !newUser.semesters.length) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        const userData = {
            username: newUser.username.trim(),
            role: 'teacher',
            sections: newUser.sections.map(id => id.toString()),
            subjects: newUser.subjects.map(id => id.toString()),
            semesters: newUser.semesters.map(id => id.toString()),
            advisorySection: newUser.advisorySection 
                ? { section: newUser.advisorySection.toString() }
                : null
        };
        
        // Only include password if it was changed
        if (newUser.password) {
            userData.password = newUser.password;
        }
        
        try {
            const token = localStorage.getItem('token');
            await apiRequest(`/api/admin/users/${selectedUserId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userData)
            });
            
            // Fetch updated data
            const updatedTeachers = await apiRequest('/api/admin/users?role=teacher', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update context
            dispatch({ type: 'SET_DATA', payload: { teacherUsers: updatedTeachers } });
            
            // Reset and close
            resetForm();
            handleClose();
            toast.info('Teacher account updated successfully!');
        } catch (error) {
            console.error('Error updating teacher account:', error);
            if (error.message && error.message.includes('Username already exists')) {
                toast.error('This username is already taken!');
            } else {
                toast.error(error.message || 'Failed to update teacher account');
                setError(error.message || 'Failed to update teacher account');
            }
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
                    const response = await fetch('/api/admin/subjects/filter', {
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
                                    <InputGroup style={{ width: "400px" }}>
                                        <InputGroup.Text>
                                            <FaSearch />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Search for a teacher name (e.g., John Doe)"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            maxLength={SEARCH_MAX_LENGTH}
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
                                validations={validations}
                                setValidations={setValidations}
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