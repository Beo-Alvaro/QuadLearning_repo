import { Container, Card } from 'react-bootstrap';
import '../AdminComponents/AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState , useEffect } from 'react';
import AdminSidebar from "../AdminComponents/AdminSidebar"; 
import '../AdminComponents/AdminTableList.css';
import Header from '../components/Header';
import { useStudentDataContext } from '../hooks/useStudentsDataContext';
import StudModals from '../AdminComponents/CreateStudentComponents/StudModals';
import StudTables from '../AdminComponents/CreateStudentComponents/StudTables';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const AdminCreateStudentAccount = () => {

        const { users, strands, sections, subjects, semesters, yearLevels,fetchData } = useStudentDataContext()
        
        const [error, setError] = useState(null)

        // Declare editUser state with a default value BEFORE any useEffects
        const [editUser, setEditUser] = useState({
            id: '',
            username: '',
            role: 'student',
            strand: '',
            section: '',
            subjects: [],
            semester: '',
            yearLevel: '',
        });

    const [show, setShow] = useState(false);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredSections, setFilteredSections] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: 'student',
        strand: '',
        section: '',
        subjects: [],
        semester: '',
        yearLevel: '',
    });
    const [selectedStrand, setSelectedStrand] = useState("");
    const [selectedSection, setSelectedSection] = useState("");

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleClose = () => {
        setShow(false);
        setSelectedUserId(null);  // Reset selectedUserId when modal closes
    };

    const handleShow = (userId) => {
        setSelectedUserId(userId);  // Set the userId when showing modal
        setShow(true);
        toast.warn('Are you sure you want to delete this user? This action is permanent and cannot be undone.')
    };

    const deleteHandler = async (userId) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        console.log("Deleting user with ID:", userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Ensure token is included
                }
            });
    
            console.log("Response status:", response.status);
            if (response.ok) {
                handleClose(); // Close the modal after deletion
                fetchData(); // Refresh the user list after deletion
                toast.success('User deleted successfully!');
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
        e.preventDefault();
        const token = localStorage.getItem('token');
    
        const userData = {
            username: newUser.username,
            password: newUser.password,
            role: 'student',
            sections: [newUser.section],  // Wrap the section ID in an array
            strand: newUser.strand,
            yearLevel: newUser.yearLevel,
            semester: newUser.semester,
            subjects: newUser.subjects,
        };
    
        console.log('Sending User Data:', userData);
    
        try {
            const response = await fetch('/api/admin/addUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            });
    
            const data = await response.json();
            console.log('Response Data:', data);
    
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create user');
            }
    
            setNewUser({
                username: '',
                password: '',
                role: 'student',
                strand: '',
                section: '',
                subjects: [],
                semester: '',
                yearLevel: ''
            });
            
            setShowAddModal(false);
            fetchData();
            toast.success('User created successfully!');
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        }
    };

useEffect(() => {
    const safeFilterSections = (strandId) => {
        if (!strandId || !sections || sections.length === 0) {
            return [];
        }

        return sections.filter(section => {
            // Ensure section and its properties are valid
            if (!section || !section.strand) {
                console.warn('Invalid section or missing strand:', section);
                return false;
            }

            const sectionStrandId = typeof section.strand === 'object' 
                ? section.strand._id 
                : section.strand;

            return sectionStrandId && sectionStrandId === strandId;
        });
    };

    let filteredSectionsResult = [];

    // Use optional chaining and provide a fallback
    const activeStrand = (showAddModal ? newUser.strand : editUser?.strand) || '';

    if (activeStrand) {
        filteredSectionsResult = safeFilterSections(activeStrand);
    }

    setFilteredSections(filteredSectionsResult);
}, [newUser.strand, editUser?.strand, sections, showAddModal]);

useEffect(() => {
    // Use a default empty object to prevent initialization error
    const activeUser = showAddModal ? newUser : (editUser || {
        id: '',
        username: '',
        role: 'student',
        strand: '',
        section: '',
        subjects: [],
        semester: '',
        yearLevel: '',
    });

    if (activeUser.strand && activeUser.semester && activeUser.yearLevel) {
        const filteredSubjects = subjects.filter(subject => {
            // Ensure subject and its properties are valid
            if (!subject || !subject.strand || !subject.semester || !subject.yearLevel) {
                console.warn('Invalid subject or missing properties:', subject);
                return false;
            }

            return (
                (typeof subject.strand === 'object' 
                    ? subject.strand._id 
                    : subject.strand) === activeUser.strand &&
                (typeof subject.semester === 'object' 
                    ? subject.semester._id 
                    : subject.semester) === activeUser.semester &&
                (typeof subject.yearLevel === 'object' 
                    ? subject.yearLevel._id 
                    : subject.yearLevel) === activeUser.yearLevel
            );
        });

        setAvailableSubjects(filteredSubjects);
    } else {
        setAvailableSubjects([]);
    }
}, [
    newUser.strand, 
    newUser.semester, 
    newUser.yearLevel,
    editUser?.strand, 
    editUser?.semester,     
    editUser?.yearLevel,
    subjects, 
    showAddModal
]);

// Update handleEditShow
const handleEditShow = (user) => {
    setEditUser({
        id: user._id,
        username: user.username,
        role: user.role,
        strand: user.strand?._id || '',
        yearLevel: user.yearLevel?._id || '',
        semester: user.semester?._id || '',
        section: user.sections?.[0]?._id || '',
        subjects: user.subjects?.map(subject => subject._id) || [],
    });
    setEditModalShow(true);
};

const handleEditClose = () => {
    setEditModalShow(false);
    setEditUser({
        id: '',
        username: '',
        strand: '',
        section: '',
        subjects: []
    });
};

const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const userData = {
            username: editUser.username,
            role: 'student',
            sections: [editUser.section || null], // Ensure null if undefined or empty
            strand: editUser.strand,
            yearLevel: editUser.yearLevel,
            semester: editUser.semester,
            subjects: editUser.subjects,
        };

        const response = await fetch(`/api/admin/users/${editUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update user');
        }

        handleEditClose();
        fetchData(); // Refresh the data
        toast.success('User updated successfully!');
    } catch (error) {
        setError(error.message);
        console.error('Error:', error);
    } finally {
        setLoading(false);
    }
};

const filteredUsers = (users || [])
    .filter((user) => user.role === "student")
    .filter((user) => user.status === "active")
    .filter((user) => (selectedStrand ? user.strand?._id === selectedStrand : true))
    .filter((user) => (selectedSection ? user.sections?.some(section => section._id === selectedSection) : true))
    .filter((user) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    );
    
    const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <>
        <Header/>
        <AdminSidebar/>
        <ToastContainer />
        <div className='d-flex'>
        <main className="main-content flex-grow-1">
        <Container fluid>
             {/* User Accounts Table */}
             <Card>
        <Card.Body>
            <Card.Title>Student Accounts</Card.Title>

            <StudTables
  selectedStrand={selectedStrand}
  setSelectedStrand={setSelectedStrand}
  selectedSection={selectedSection}
  setSelectedSection={setSelectedSection}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  strands={strands}
  sections={sections}
  entriesPerPage={entriesPerPage}
  setEntriesPerPage={setEntriesPerPage}
  filteredUsers={filteredUsers}
  currentPage={currentPage}
  totalPages={totalPages}
  handlePageChange={handlePageChange}
  setShowAddModal={setShowAddModal}
  handleEditShow={handleEditShow}
  handleShow={handleShow}
/>


                                <StudModals
    showAddModal={showAddModal}
    setShowAddModal={setShowAddModal}
    show={show}
    handleClose={handleClose}
    editModalShow={editModalShow}
    handleEditClose={handleEditClose}
    newUser={newUser}
    setNewUser={setNewUser}
    editUser={editUser}
    setEditUser={setEditUser}
    yearLevels={yearLevels}
    strands={strands}
    semesters={semesters}
    filteredSections={filteredSections}
    availableSubjects={availableSubjects}
    handleAddUser={handleAddUser}
    handleEditSubmit={handleEditSubmit}
    deleteHandler={deleteHandler}
    error={error}
    selectedUserId={selectedUserId}
/>

        </Card.Body>
        </Card>
        </Container>
        </main>
        </div>
            </>
     );

}

export default AdminCreateStudentAccount;