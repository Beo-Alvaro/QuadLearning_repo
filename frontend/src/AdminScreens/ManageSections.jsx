import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../components/Header';
import { useSectionDataContext } from '../hooks/useSectionDataContext';
import SectionForm from '../AdminComponents/CreateSectionComponent.jsx/SectionForm';
import SectionTable from '../AdminComponents/CreateSectionComponent.jsx/SectionTable';
import SectionModal from '../AdminComponents/CreateSectionComponent.jsx/SectionModal';
const ManageSections = () => {
    const navigate = useNavigate();
    const { studSections, studStrands, yearLevels, error, fetchData, handleSaveChanges, linkedStrand, linkedYearLevel, name, setName, setLinkedStrand,setLinkedYearLevel, handleSubmit, deleteHandler: contextDeleteHandler, 
     } = useSectionDataContext();

    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const handleClose = () => {
        setShow(false);
        setSelectedSectionId(null);
    };

    const handleShow = (sectionId) => {
        setSelectedSectionId(sectionId);
        setShow(true);
        toast.warn('Are you sure you want to delete this section? This action is permanent and cannot be undone.')
    };

    const handleEditShow = (sectionId) => {
        setSelectedSectionId(sectionId); // Set the section ID when opening the modal
        const section = studSections.find((section) => section._id === sectionId);
        if (section) {
            setName(section.name);
            setLinkedStrand(section.strand);
            setLinkedYearLevel(section.yearLevel);
            setEditModalShow(true);  // Open modal
        }
    };

    const handleSaveChangesWithModalClose = async (selectedSectionId) => {
        const success = await handleSaveChanges(selectedSectionId);
        if (success) {
            setEditModalShow(false); 
            toast.success('Section updated successfully!')
        }
    };
    
    const handleCloseModal = () => {
        setEditModalShow(false); 
    };

    const deleteHandler = async (id) => {
        try {
            await contextDeleteHandler(id);  // Use the deleteHandler from context
            await fetchData(); // Refresh the list after deletion
            setShow(false); // Close the modal after successful deletion
            toast.error('Section deleted successfully!')
        } catch (error) {
            console.error("Error deleting section:", error);
        }
    };
    
    

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
                                <h4 className="mb-0">Manage Sections</h4>
                            </Card.Header>
                            <Card.Body>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

<SectionForm 
  name={name}
  setName={setName}
  linkedStrand={linkedStrand}
  setLinkedStrand={setLinkedStrand}
  linkedYearLevel={linkedYearLevel}
  setLinkedYearLevel={setLinkedYearLevel}
  studStrands={studStrands}
  yearLevels={yearLevels}
  loading={loading}
  handleSubmit={handleSubmit}
  navigate={navigate}
/>

<SectionTable
  handleEditShow={handleEditShow}
  handleShow={handleShow}
  studSections={studSections} 
/>
                            </Card.Body>
                        </Card>
                    </Container>
                    <SectionModal
                show={show}
                setShow={setShow}
                handleClose={handleClose}
                editModalShow={editModalShow}
                handleCloseModal={handleCloseModal}
                handleSaveChanges={handleSaveChangesWithModalClose}
                selectedSectionId={selectedSectionId}
                deleteHandler={deleteHandler}
            />
                  
                                            </main>
                                        </div>
                                    </>
    );
};

export default ManageSections;
