import { useState, useEffect } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import Modal from 'react-bootstrap/Modal';
import { toast, ToastContainer } from 'react-toastify';
import Header from '../components/Header';
import { useSubjectDataContext } from '../hooks/useSubjectDataContext';
import SubjectForm from '../AdminComponents/CreateSubjectComponents/SubjectForm';
import SubjectTable from '../AdminComponents/CreateSubjectComponents/SubjectTable';
import SubjectModal from '../AdminComponents/CreateSubjectComponents/SubjectModal';
const ManageSubjects = () => {
    const navigate = useNavigate();
    const { 
        studSubjects,
        error,
        handleDeleteSubject,
        fetchAllData } = useSubjectDataContext();
    const [show, setShow] = useState(false);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [selectedStrand, setSelectedStrand] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [semester, setSemester] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [editModalShow, setEditModalShow] = useState(false);


    const deleteHandler = async (id) => {
        try {
            await handleDeleteSubject(id);
            fetchAllData(); // Refresh the list after deletion
            setShow(false);
            toast.error('Subject deleted successfully!')
        } catch (error) {
            console.error("Error deleting semester:", error);
        }
    };

    const handleClose = () => {
        setShow(false);
        setSelectedSubjectId(null);  // Reset selectedUserId when modal closes
    };

    const handleShow = (subjectId) => {
        setSelectedSubjectId(subjectId);  // Set the userId when showing modal
        setShow(true);
        toast.warn('Are you sure you want to delete this subject? This action is permanent and cannot be undone.')
    };

    const handleEditShow = (subjectId) => {
        const subject = studSubjects.find((subj) => subj._id === subjectId);
        if (subject) {
            setSelectedSubjectId(subjectId);
            setName(subject.name);
            setCode(subject.code);
            setSemester(subject.semester);
            setSelectedStrand(subject.strand._id);
            setSelectedYearLevel(subject.yearLevel._id);
            setSelectedSemester(subject.semester);  
            setEditModalShow(true);
        } else {
            console.error('Subject not found');
        }
    };
    
    const handleCloseModal = () => {
        setEditModalShow(false);
        setSelectedSubjectId(null); // Reset selected subject data only when modal closes
        setName('');  // Clear name
        setCode('');  // Clear code
        setSemester('');  // Clear semester
        setSelectedStrand('');
        setSelectedYearLevel('');
        setSelectedSemester('');
    };

    // Fetch data when the component mounts
    useEffect(() => {
        fetchAllData();
    }, []);

    return (
        <>
        <Header/>
            <AdminSidebar />
            <ToastContainer />
            <div className='d-flex'>
                <main className="main-content flex-grow-1">
                    <Container>
                        <Card className="mt-4">
                            <Card.Header>
                                <h4 className="mb-0">Create New Subject</h4>
                            </Card.Header>
                            <Card.Body>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                       <SubjectForm/>
                                
                                       <SubjectTable
                                       studSubjects={studSubjects}
              handleEditShow={handleEditShow}
              handleShow={handleShow}
            />

                            </Card.Body>
                        </Card>
                    </Container>
                  
                    <SubjectModal 
  show={show}
  editModalShow={editModalShow}
  handleClose={handleClose}
  handleCloseModal={handleCloseModal}
  selectedSubjectId={selectedSubjectId}
  name={name}  
  code={code}   
  selectedStrand={selectedStrand}  
  selectedYearLevel={selectedYearLevel} 
  selectedSemester={selectedSemester} 
  setName={setName}  
  setCode={setCode}  
  setSelectedStrand={setSelectedStrand}  
  setSelectedYearLevel={setSelectedYearLevel} 
  setSelectedSemester={setSelectedSemester} 
  deleteHandler={deleteHandler}
/>


                </main>
            </div>
        </>
    );
};

export default ManageSubjects;