import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const SemesterModal = ({
  show,
  handleClose,
  editModalShow,
  handleCloseModal,
  deleteHandler,
  handleSaveChanges,
  selectedSemesterId,
  selectedStrand,
  setSelectedStrand,
  strands,
  name,
  setName,
  selectedYearLevel,
  setSelectedYearLevel,
  yearLevels,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  error,
  loading,
}) => {
  return (
    <div>
      {/* Delete Confirmation Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className='text-center w-100'>CONFIRMATION MESSAGE</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center w-100'>
          The data will be erased and cannot be retrieved. Are you sure you want to continue?
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="outline-secondary" className="px-4" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="outline-danger"
            className="px-4"
            onClick={() => selectedSemesterId && deleteHandler(selectedSemesterId)}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Semester Modal */}
      <Modal show={editModalShow} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Semester</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Strand</Form.Label>
              <Form.Control
                as="select"
                value={selectedStrand}
                onChange={(e) => setSelectedStrand(e.target.value)}
                required
              >
                <option value="">Select Strand</option>
                {strands.map((strand) => (
                  <option key={strand._id} value={strand._id}>
                    {strand.name || 'Unnamed Strand'}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Semester Period</Form.Label>
              <Form.Control as="select" value={name} onChange={(e) => setName(e.target.value)}>
                <option value="">Select Semester</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="Summer Term">Summer Term</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Year Level</Form.Label>
              <Form.Control
                as="select"
                value={selectedYearLevel}
                onChange={(e) => setSelectedYearLevel(e.target.value)}
                required
              >
                <option value="">Select Year Level</option>
                {yearLevels.map((yearLevel) => (
                  <option key={yearLevel._id} value={yearLevel._id}>
                    {yearLevel.name || 'Unnamed Year Level'}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="outline-success" onClick={handleSaveChanges} disabled={loading}>
            {loading ? 'Updating...' : 'Update Semester'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SemesterModal;
