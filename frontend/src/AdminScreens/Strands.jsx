import { useContext, useEffect, useState } from 'react';
import { Container, Card, Form, Button, Toast } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import StrandModal from '../AdminComponents/CreateStrandsComponents/StrandModal';
import Header from '../components/Header';
import StrandTable from '../AdminComponents/CreateStrandsComponents/StrandTable';
import { useStrandsDataContext } from '../hooks/useStrandsDataContext';
import { ToastContainer, toast } from 'react-toastify';
const AdminCreateStrand = () => {
    const navigate = useNavigate();
    const {
        studStrands,
        loading,
        error,
        addStrand,
        updateStrand,
        deleteStrand,
        fetchStrands
    } = useStrandsDataContext();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedStrandId, setSelectedStrandId] = useState(null);
    const [show, setShow] = useState(false);
    const [editModalShow, setEditModalShow] = useState(false);

    const handleReset = () => {
        setName('');
        setDescription('');
    };

    const handleDeleteShow = (strandId) => {
        setSelectedStrandId(strandId);
        setShow(true); // Show the delete confirmation modal
        toast.warn('Are you sure you want to delete this strand? This action is permanent and cannot be undone.')
    };

    const handleDelete = () => {
        if (selectedStrandId) {
            deleteStrand(selectedStrandId);
            setShow(false);
            setSelectedStrandId(null); // Clear the selection after deletion
        }
    };

    const handleEditShow = (strandId) => {
        const strand = studStrands.find((strand) => strand._id === strandId);
        if (strand) {
            setSelectedStrandId(strandId);
            setName(strand.name);
            setDescription(strand.description);
            setEditModalShow(true);
        }
    };

    const handleCloseModal = () => {
        setEditModalShow(false);
        setSelectedStrandId(null);
        handleReset();
    };

    const handleSaveChanges = () => {
        const updatedStrand = { name, description };
        updateStrand(selectedStrandId, updatedStrand);
        handleCloseModal();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newStrand = { name, description };
        addStrand(newStrand);
        handleReset();
    };

    useEffect(() => {
        fetchStrands();
    }, []);

    return (
        <>
            <Header />
            <AdminSidebar />
            <ToastContainer />
            <div className="d-flex">
                <main className="main-content flex-grow-1">
                    <Container>
                        <Card className="mt-4">
                            <Card.Header>
                                <h4 className="mb-0">Create New Strand</h4>
                            </Card.Header>
                            <Card.Body>
                                {error && <div className="alert alert-danger">{error}</div>}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Strand Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder='e.g STEM'
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder='e.g Science, Technology, Engineering, and Mathematics'
                                            required
                                        />
                                    </Form.Group>

                                    <Button variant="outline-success" type="submit" disabled={loading}>
                                        {loading ? 'Creating...' : 'Create Strand'}
                                    </Button>
                                </Form>

                                <StrandTable
    studStrands={studStrands}
    handleEditShow={handleEditShow}
    handleDeleteShow={handleDeleteShow}
/>

                            </Card.Body>
                        </Card>
                    </Container>

                    <StrandModal
                        show={show}
                        setShow={setShow}
                        editModalShow={editModalShow}
                        handleCloseModal={handleCloseModal}
                        name={name}
                        description={description}
                        setName={setName}
                        setDescription={setDescription}
                        handleSaveChanges={handleSaveChanges}
                        handleDelete={handleDelete}
                    />
                </main>
            </div>
        </>
    );
};

export default AdminCreateStrand;
