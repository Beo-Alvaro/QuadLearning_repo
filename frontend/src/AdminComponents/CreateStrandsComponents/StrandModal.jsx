import { Modal, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';

const StrandModal = ({
    show,
    setShow,
    deleteHandler,
    selectedStrandId,
    editModalShow,
    handleCloseModal,
    name,
    description,
    setName,
    setDescription,
    handleSaveChanges,
    handleDelete
}) => {
    return (
        <div>
            {/* Confirmation Modal */}
            <Modal show={show} onHide={() => setShow(false)} className='text-center'>
                <Modal.Header closeButton className='text-center'>
                    <Modal.Title className='text-center w-100'>CONFIRMATION MESSAGE</Modal.Title>
                </Modal.Header>
                <Modal.Body>The data will be erased and cannot be retrieved. Are you sure you want to continue?</Modal.Body>
                <Modal.Footer className='justify-content-center'>
                    <Button variant="outline-secondary" className="px-4" onClick={() => setShow(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="outline-danger" 
                        className="px-4" 
                        onClick={handleDelete}
                    >
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Modal */}
            <Modal show={editModalShow} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Strand</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Strand Name */}
                        <Form.Group className="mb-3">
                            <Form.Label>Strand Name
                                                            <OverlayTrigger
                                                                    placement="right"
                                                                    overlay={<Tooltip className='custom-tooltip'>Strand Name is required to proceed.</Tooltip>}
                                                                >
                                                                    <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                                                            </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Strand Description */}
                        <Form.Group className="mb-3">
                            <Form.Label>Strand Description
                                                            <OverlayTrigger
                                                                    placement="right"
                                                                    overlay={<Tooltip className='custom-tooltip'>Strand Description is required to proceed.</Tooltip>}
                                                                >
                                                                    <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                                                            </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button variant="outline-success" onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default StrandModal;
