import { useSectionDataContext } from '../../hooks/useSectionDataContext'
import Modal from 'react-bootstrap/Modal';
import { Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

const SectionModal = ({
    show,
    handleClose,
    editModalShow,
    handleCloseModal,
    handleSaveChanges,
    selectedSectionId,
    deleteHandler,
    setShow
}) => {
    // Use context to access the values
    const { name, setName, linkedStrand, setLinkedStrand, linkedYearLevel, setLinkedYearLevel, studStrands, yearLevels } = useSectionDataContext();

    return (
        <div>
            {/* Delete Confirmation Modal */}
            <Modal show={show} onHide={handleClose} className="text-center">
                <Modal.Header closeButton className="text-center">
                    <Modal.Title className="text-center w-100">CONFIRMATION MESSAGE</Modal.Title>
                </Modal.Header>
                <Modal.Body>The data will be erased and cannot be retrieved. Are you sure you want to continue?</Modal.Body>
                <Modal.Footer className="justify-content-center">
                    <Button variant="outline-secondary" className="px-4" onClick={() => setShow(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="outline-danger"
                        className="px-4"
                        onClick={() => selectedSectionId && deleteHandler(selectedSectionId)}
                    >
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Section Modal */}
            <Modal show={editModalShow} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Section</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Section Name
                            <OverlayTrigger
                                                                    placement="right"
                                                                    overlay={<Tooltip className='custom-tooltip'>Section Name is required to proceed.</Tooltip>}
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

                        {/* Strand Selection */}
                        <Form.Group className="mb-3">
                            <Form.Label>Strand
                                                                                            <OverlayTrigger
                                                                                                    placement="right"
                                                                                                    overlay={<Tooltip className='custom-tooltip'>Strand is required to proceed.</Tooltip>}
                                                                                                >
                                                                                                    <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                                                                                            </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                                as="select"
                                value={linkedStrand || ""}
                                onChange={(e) => setLinkedStrand(e.target.value)}
                                required
                            >
                                <option value="">Select Strand</option>
                                {Array.isArray(studStrands) &&
                                    studStrands.map((strand) => (
                                        <option key={strand._id} value={strand._id}>
                                            {strand.name}
                                        </option>
                                    ))}
                            </Form.Control>
                        </Form.Group>

                        {/* Year Level Selection */}
                        <Form.Group className="mb-3">
                            <Form.Label>Year Level
                                                                                            <OverlayTrigger
                                                                                                    placement="right"
                                                                                                    overlay={<Tooltip className='custom-tooltip'>Year Level is required to proceed.</Tooltip>}
                                                                                                >
                                                                                                    <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                                                                                            </OverlayTrigger>
                            </Form.Label>
                            <Form.Select
                                value={linkedYearLevel}
                                onChange={(e) => setLinkedYearLevel(e.target.value)}
                                required
                            >
                                <option value="">Select Year Level</option>
                                {yearLevels.map((yearLevel) => (
                                    <option key={yearLevel._id} value={yearLevel._id}>
                                        {yearLevel.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button
                        variant="outline-success"
                        onClick={() => handleSaveChanges(selectedSectionId)}
                    >
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SectionModal;
