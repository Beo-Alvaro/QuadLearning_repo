import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import { FaSearch } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Header from '../components/Header';
import { useSemesterDataContext } from '../hooks/useSemesterDataContext'
import SemesterForm from '../AdminComponents/CreateSemesterComponents/SemesterForm';
import SemesterTable from '../AdminComponents/CreateSemesterComponents/SemesterTable';
import SemesterModal from '../AdminComponents/CreateSemesterComponents/SemesterModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageSemesters = () => {
    const navigate = useNavigate();
    const [selectedSemesterId, setselectedSemesterId] = useState(null);
    const [name, setName] = useState('');
    const [selectedStrand, setSelectedStrand] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [show, setShow] = useState(false);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedYearLevel, setSelectedYearLevel] = useState('');

    const {
        semesters,
        fetchData,
        addSemester,
        updateSemester,
        deleteSemester,
        loading,
        error,
        strands,
        yearLevels,
        setSemesters
    } = useSemesterDataContext();

    const {
        semesters,
        fetchData,
        addSemester,
        updateSemester,
        deleteSemester,
        loading,
        error,
        strands,
        yearLevels,
        setSemesters
    } = useSemesterDataContext();

    const endSemester = async (semesterId) => {
        const token = localStorage.getItem('token')
        try {
            const response = await fetch(`/api/admin/endSemester/${semesterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const data = await response.json();
            
            
            if (response.ok) {
                fetchData(); // Refresh the list after ending the semester
                toast.success('Semester ended successfully!')
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error ending semester:', error);
        }
    };
    
    useEffect(() => {
        fetchData(); 
    }, []);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addSemester({
                name,
                strand: selectedStrand,
                yearLevel: selectedYearLevel,
                startDate,
                endDate,
            });
            fetchData(); // Refresh the list after submission
            resetFormState();
            toast.success('Semester created successfully!');
            alert('Semester created successfully!');
        } catch (error) {
            console.error("Error adding semester:", error);
        }
    };
    
    const handleSaveChanges = async () => {
        try {
            const updatedSemester = {
                _id: selectedSemesterId, 
                name,
                strand: selectedStrand,
                yearLevel: selectedYearLevel,
                startDate,
                endDate,
            };

            // Call the updateSemester function from context
            await updateSemester(updatedSemester, selectedSemesterId);
            
            setEditModalShow(false);
            toast.success('Semester updated successfully!')
            alert('Semester updated successfully!');
        } catch (error) {
            console.error("Error updating semester:", error);
        }
    };

    const resetFormState = () => {
        setName('');
        setSelectedStrand('');
        setSelectedYearLevel('');
        setStartDate('');
        setEndDate('');
    };

    const deleteHandler = async (id) => {
        try {
            await deleteSemester(id);
            fetchData(); // Refresh the list after deletion
            setShow(false);
            toast.error('Semester deleted successfully!')
            alert('Semester deleted successfully!');
        } catch (error) {
            console.error("Error deleting semester:", error);
        }
    };

    const handleClose = () => {
        setShow(false);
        resetFormState(); // Clear form values when closing any modal
        setselectedSemesterId(null);
    };

    const handleShow = (semesterId) => {
        setselectedSemesterId(semesterId);
        setShow(true);
        toast.warn('Are you sure you want to delete this semester? This action is permanent and cannot be undone.')
    };

    const handleEdit = (semester) => {
        setselectedSemesterId(semester._id);
        setName(semester.name || '');
        setSelectedStrand(semester.strand?._id || '');
        setSelectedYearLevel(semester.yearLevel?._id || ''); 
        setStartDate(semester.startDate?.split('T')[0] || '');
        setEndDate(semester.endDate?.split('T')[0] || '');
        setEditModalShow(true);
    };

    const handleCloseModal = () => {
        setEditModalShow(false);
        resetFormState(); // Clear form fields
        setselectedSemesterId(null);
    };

    return (
        <>
            <Header />
            <AdminSidebar />
            <div className="d-flex">
                <main className="main-content flex-grow-1">
                <ToastContainer />
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

                                <SemesterForm
                                    strands={strands}
                                    yearLevels={yearLevels}
                                    selectedStrand={selectedStrand}
                                    setSelectedStrand={setSelectedStrand}
                                    selectedYearLevel={selectedYearLevel}
                                    setSelectedYearLevel={setSelectedYearLevel}
                                    name={name}
                                    setName={setName}
                                    startDate={startDate}
                                    setStartDate={setStartDate}
                                    endDate={endDate}
                                    setEndDate={setEndDate}
                                    loading={loading}
                                    handleSubmit={handleSubmit}
                                    isEditMode={!!selectedSemesterId} // Optional for better UI handling
                                />

                                <SemesterTable
                                    semesters={semesters}
                                    handleEdit={handleEdit}
                                    handleShow={handleShow}
                                    endSemester={endSemester}
                                />
                            </Card.Body>
                        </Card>
                    </Container>
                </main>
            </div>

            <SemesterModal
                show={show}
                handleClose={handleClose}
                editModalShow={editModalShow}
                handleCloseModal={handleCloseModal}
                deleteHandler={deleteHandler}
                handleSaveChanges={handleSaveChanges}
                selectedSemesterId={selectedSemesterId}
                selectedStrand={selectedStrand}
                setSelectedStrand={setSelectedStrand}
                strands={strands}
                name={name}
                setName={setName}
                selectedYearLevel={selectedYearLevel}
                setSelectedYearLevel={setSelectedYearLevel}
                yearLevels={yearLevels}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                error={error}
                loading={loading}
            />
        </>
    );
};

export default ManageSemesters;