import React, { useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useSubjectDataContext } from '../../hooks/useSubjectDataContext';
const SubjectModal = ({ show, editModalShow, handleClose, handleCloseModal, selectedSubjectId, name, code, selectedStrand, selectedYearLevel, selectedSemester  ,setSelectedStrand,
    setSelectedYearLevel, setName, setCode,setSelectedSemester, deleteHandler}) => {
    const {
      strands,
      yearLevels,
      filteredSemesters,
      handleUpdateSubject,
    } = useSubjectDataContext();
  
    const handleSubmitUpdateSubject = () => {
        if (!name || !code || !selectedStrand || !selectedYearLevel || !selectedSemester) {
            setError('All fields are required');
            return;
        }
    
        const updatedSubject = {
            name,
            code,
            selectedStrand,
            selectedYearLevel,
            selectedSemester: selectedSemester._id || selectedSemester, // Ensure sending only the ID
        };
    
        console.log('Updated Subject:', updatedSubject); // Log to ensure the correct data
    
        handleUpdateSubject(selectedSubjectId, updatedSubject);
        handleCloseModal()
    };
    
  
    return (
      <div>
        {/* Confirmation Modal */}
        <Modal show={show} onHide={handleClose} className="text-center">
          <Modal.Header closeButton className="text-center">
            <Modal.Title className="text-center w-100">CONFIRMATION MESSAGE</Modal.Title>
          </Modal.Header>
          <Modal.Body>The data will be erased and cannot be retrieved. Are you sure you want to continue?</Modal.Body>
          <Modal.Footer className="justify-content-center">
            <Button variant="outline-secondary" className="px-4" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="outline-danger"
              className="px-4"
              onClick={() => selectedSubjectId && deleteHandler(selectedSubjectId)}
            >
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
  
        {/* Edit Modal */}
        <Modal show={editModalShow} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Subject</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
            <Form.Group className="mb-3">
  <Form.Label>Strand</Form.Label>
  <Form.Select
    value={selectedStrand}
    onChange={(e) => setSelectedStrand(e.target.value)}  // Correct setter usage
    required
  >
    <option value="">Select Strand</option>
    {strands.map((strand) => (
      <option key={strand._id} value={strand._id}>
        {strand.name}
      </option>
    ))}
  </Form.Select>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Year Level</Form.Label>
  <Form.Control
    as="select"
    value={selectedYearLevel}
    onChange={(e) => setSelectedYearLevel(e.target.value)}  // Correct setter usage
    required
  >
    <option value="">Select Year Level</option>
    {yearLevels.map((yearLevel) => (
      <option key={yearLevel._id} value={yearLevel._id}>
        {yearLevel.name}
      </option>
    ))}
  </Form.Control>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Term</Form.Label>
  <Form.Select
    value={selectedSemester}
    onChange={(e) => setSelectedSemester(e.target.value)}  // Correct setter usage
    required
    disabled={!selectedStrand || !selectedYearLevel}
  >
    <option value="">Select Term</option>
    {filteredSemesters.length > 0 ? (
      filteredSemesters.map((semester) => (
        <option key={semester._id} value={semester._id}>
          {`${semester.name} - ${semester.strand.name}`}
        </option>
      ))
    ) : (
      <option>No terms available</option> // Optional message for empty array
    )}
  </Form.Select>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Subject Name</Form.Label>
  <Form.Control
    type="text"
    placeholder="Enter subject name"
    value={name}
    onChange={(e) => setName(e.target.value)}  // Correct setter usage
    required
  />
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Subject Code</Form.Label>
  <Form.Control
    type="text"
    placeholder="Enter subject code"
    value={code}
    onChange={(e) => setCode(e.target.value)}  // Correct setter usage
    required
  />
</Form.Group>
            </Form>
          </Modal.Body>
  
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="outline-success" onClick={handleSubmitUpdateSubject}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  };
  
  export default SubjectModal;
  