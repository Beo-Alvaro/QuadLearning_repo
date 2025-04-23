import { Modal, Button, Form } from 'react-bootstrap';
const StudModals = ({
    showAddModal, setShowAddModal,
    show, handleClose,
    editModalShow, handleEditClose,
    newUser, setNewUser,
    editUser, setEditUser,
    yearLevels, strands, semesters, filteredSections, availableSubjects,
    handleAddUser, handleEditSubmit, deleteHandler, loading,
    error, selectedUserId
}) => {
        // First, add these styles at the top of your file
    const modalStyles = {
        modal: {
          maxWidth: '800px',
          margin: '1.75rem auto',
        },
        formGrid: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
        },
        fullWidth: {
          gridColumn: '1 / -1',
        },
        formSection: {
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        },
        modalHeader: {
          background: '#f8f9fa',
          borderBottom: '2px solid #dee2e6',
          padding: '1rem 1.5rem',
        },
        modalFooter: {
          background: '#f8f9fa',
          borderTop: '2px solid #dee2e6',
          padding: '1rem 1.5rem',
        },
        deleteModal: {
          textAlign: 'center',
          padding: '2rem',
        },
        deleteIcon: {
          fontSize: '3rem',
          color: '#dc3545',
          marginBottom: '1rem',
        }
      };
    return ( <div>
        <Modal 
    show={showAddModal} 
    onHide={() => setShowAddModal(false)}
    size="lg"
    centered
>
    <Modal.Header closeButton style={modalStyles.modalHeader}>
        <Modal.Title>
            <i className="bi bi-person-plus-fill me-2"></i>
            Add New Student Account
        </Modal.Title>
    </Modal.Header>
    <Modal.Body className="p-4">
        <Form onSubmit={handleAddUser}>
            {/* Basic Information Section */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Basic Information</h6>
                <div style={modalStyles.formGrid}>
                    <Form.Group>
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={newUser.username}
                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            required
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            required
                        />
                    </Form.Group>
                </div>
            </div>

            {/* Academic Information Section */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Academic Information</h6>
                <div style={modalStyles.formGrid}>
                    <Form.Group>
                        <Form.Label>Year Level</Form.Label>
                        <Form.Select
                            value={newUser.yearLevel}
                            onChange={(e) => setNewUser({...newUser, yearLevel: e.target.value, semester: '', subjects: []})}
                            required
                        >
                            <option value="">Select Year Level</option>
                            {yearLevels.map(yearLevel => (
                                <option key={yearLevel._id} value={yearLevel._id}>
                                    {yearLevel.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Strand</Form.Label>
                        <Form.Select
    value={newUser .strand}
    onChange={(e) => setNewUser ({...newUser , strand: e.target.value, section: '', subjects: []})}
    required
>
    <option value="">Select Strand</option>
    {strands.map(strand => (
        <option key={strand._id} value={strand._id}>
            {strand.name || 'Unnamed Strand'}
        </option>
    ))}
</Form.Select>
                    </Form.Group>

    
                    <Form.Group>
    <Form.Label>Semester</Form.Label>
    <Form.Select
        value={newUser.semester}
        onChange={(e) => {
            const selectedSemesterId = e.target.value;
            
            // Find the selected semester to validate its properties
            const selectedSemester = semesters.find(
                semester => semester._id === selectedSemesterId
            );

            // Ensure the selected semester matches the current strand and year level
            if (selectedSemester) {
                const strandMatch = 
                    (typeof selectedSemester.strand === 'object' 
                        ? selectedSemester.strand._id 
                        : selectedSemester.strand) === newUser.strand;
                
                const yearLevelMatch = 
                    (typeof selectedSemester.yearLevel === 'object' 
                        ? selectedSemester.yearLevel._id 
                        : selectedSemester.yearLevel) === newUser.yearLevel;

                if (strandMatch && yearLevelMatch) {
                    setNewUser({
                        ...newUser, 
                        semester: selectedSemesterId, 
                        subjects: [] // Reset subjects when semester changes
                    });
                } else {
                    // Optionally, show an error or prevent selection
                    console.error('Selected semester does not match current strand or year level');
                }
            }
        }}
        required
        disabled={!newUser.strand || !newUser.yearLevel}
    >
        <option value="">Select Semester</option>
        {semesters
            .filter(semester => {
                // Filter for active semesters only
                const isActive = semester.status === 'active';
                
                // More comprehensive filtering
                const hasValidStrand = semester.strand && 
                    (typeof semester.strand === 'object' 
                        ? semester.strand._id === newUser.strand 
                        : semester.strand === newUser.strand);
                
                const hasValidYearLevel = semester.yearLevel && 
                    (typeof semester.yearLevel === 'object' 
                        ? semester.yearLevel._id === newUser.yearLevel 
                        : semester.yearLevel === newUser.yearLevel);
                
                return isActive && hasValidStrand && hasValidYearLevel;
            })
            .map(semester => {
                // Safely extract strand and year level names
                const strandName = 
                    (semester.strand && semester.strand.name) 
                    || (typeof semester.strand === 'string' ? semester.strand : 'Unknown Strand');
                
                const yearLevelName = 
                    (semester.yearLevel && semester.yearLevel.name) 
                    || (typeof semester.yearLevel === 'string' ? semester.yearLevel : 'Unknown Year Level');

                return (
                    <option 
                        key={semester._id} 
                        value={semester._id}
                    >
                        {semester.name} - {strandName} - {yearLevelName}
                    </option>
                );
            })
        }
    </Form.Select>
</Form.Group>


                    <Form.Group>
                        <Form.Label>Section</Form.Label>
                        <Form.Select
                            value={newUser.section}
                            onChange={(e) => setNewUser({...newUser, section: e.target.value})}
                            required
                            disabled={!newUser.strand}
                        >
                            <option value="">Select Section</option>
                            {filteredSections.map(section => (
                                <option key={section._id} value={section._id}>
                                    {section.name} - {section.yearLevel.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
            </div>

          {/* Subjects Section */}
<div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
    <h6 className="mb-3">Subjects</h6>

    {availableSubjects.length > 0 ? (
        <>
            {/* Select All Checkbox */}
            <Form.Check
                type="checkbox"
                id="select-all-subjects"
                label="Select All Subjects"
                checked={newUser.subjects.length === availableSubjects.length}
                onChange={(e) => {
                    setNewUser(prev => ({
                        ...prev,
                        subjects: e.target.checked
                            ? availableSubjects.map(subject => subject._id) // Select all
                            : [] // Deselect all
                    }));
                }}
            />

            <div className="subjects-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.5rem' 
            }}>
                {availableSubjects.map(subject => (
                    <Form.Check
                        key={subject._id}
                        type="checkbox"
                        id={`add-${subject._id}`}
                        label={subject.name}
                        checked={newUser.subjects.includes(subject._id)}
                        onChange={(e) => {
                            setNewUser(prev => ({
                                ...prev,
                                subjects: e.target.checked
                                    ? [...prev.subjects, subject._id]
                                    : prev.subjects.filter(id => id !== subject._id)
                            }));
                        }}
                    />
                ))}
            </div>
        </>
    ) : (
        <p className="text-muted">
            Please select strand, year level, and semester to view available subjects
        </p>
    )}
</div>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </Form>
    </Modal.Body>
    <Modal.Footer style={modalStyles.modalFooter}>
        <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>
            <i className="bi bi-x-circle me-2"></i>Cancel
        </Button>
        <Button variant="outline-success" onClick={handleAddUser}>
            <i className="bi bi-check-circle me-2"></i>Add Student
        </Button>
    </Modal.Footer>
</Modal>

{/* Delete Modal */}
<Modal show={show} onHide={handleClose} centered>
    <Modal.Body style={modalStyles.deleteModal}>
        <div style={modalStyles.deleteIcon}>
            <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h4 className="mb-3">Confirm Deletion</h4>
        <p className="text-muted">
            Are you sure you want to delete this student account? This action cannot be undone.
        </p>
    </Modal.Body>
    <Modal.Footer style={modalStyles.modalFooter} className="justify-content-center">
        <Button variant="outline-secondary" onClick={handleClose}>
            <i className="bi bi-x-circle me-2"></i>Cancel
        </Button>
        <Button variant="outline-danger" onClick={() => deleteHandler(selectedUserId)}>
            <i className="bi bi-trash me-2"></i>Delete
        </Button>
    </Modal.Footer>
</Modal>

{/* Edit Modal */}
<Modal 
    show={editModalShow} 
    onHide={handleEditClose}
    size="lg"
    centered
>
    <Modal.Header closeButton style={modalStyles.modalHeader}>
        <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>
            Edit Student Account
        </Modal.Title>
    </Modal.Header>
    <Modal.Body className="p-4">
        <Form onSubmit={handleEditSubmit}>
            {/* Basic Information */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Basic Information</h6>
                <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        value={editUser.username}
                        readOnly
                        disabled
                        className="bg-light"
                    />
                </Form.Group>
            </div>

            {/* Academic Information */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Academic Information</h6>
                <div style={modalStyles.formGrid}>
                    <Form.Group>
                        <Form.Label>Year Level</Form.Label>
                        <Form.Select
                            value={editUser.yearLevel}
                            onChange={(e) => setEditUser({...editUser, yearLevel: e.target.value, semester: '', subjects: []})}
                            required
                        >
                            <option value="">Select Year Level</option>
                            {yearLevels.map(yearLevel => (
                                <option key={yearLevel._id} value={yearLevel._id}>
                                    {yearLevel.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Strand</Form.Label>
                        <Form.Select
                            value={editUser.strand}
                            onChange={(e) => setEditUser({...editUser, strand: e.target.value, section: '', subjects: []})}
                            required
                        >
                            <option value="">Select Strand</option>
                            {strands.map(strand => (
                                <option key={strand._id} value={strand._id}>
                                    {strand.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group>
    <Form.Label>Semester</Form.Label>
    <Form.Select
        value={editUser.semester}
        onChange={(e) => setEditUser({...editUser, semester: e.target.value, subjects: []})}
        required
        disabled={!editUser.strand || !editUser.yearLevel}
    >
        <option value="">Select Semester</option>
        {semesters
            .filter(semester => {
                // Filter for active semesters only
                const isActive = semester.status === 'active';
                
                // Ensure semester has valid strand and year level
                const hasValidStrand = semester.strand && 
                    (typeof semester.strand === 'object' 
                        ? semester.strand._id === editUser.strand 
                        : semester.strand === editUser.strand);
                
                const hasValidYearLevel = semester.yearLevel && 
                    (typeof semester.yearLevel === 'object' 
                        ? semester.yearLevel._id === editUser.yearLevel 
                        : semester.yearLevel === editUser.yearLevel);
                
                return isActive && hasValidStrand && hasValidYearLevel;
            })
            .map(semester => {
                // Safely extract strand and year level names
                const strandName = 
                    (semester.strand && 
                        (typeof semester.strand === 'object' 
                            ? semester.strand.name 
                            : semester.strand)) 
                    || 'Unknown Strand';
                
                const yearLevelName = 
                    (semester.yearLevel && 
                        (typeof semester.yearLevel === 'object' 
                            ? semester.yearLevel.name 
                            : semester.yearLevel)) 
                    || 'Unknown Year Level';

                return (
                    <option 
                        key={semester._id} 
                        value={semester._id}
                    >
                        {semester.name} - {strandName} - {yearLevelName}
                    </option>
                );
            })
        }
    </Form.Select>
</Form.Group>

                    <Form.Group>
                        <Form.Label>Section</Form.Label>
                        <Form.Select
                            value={editUser.section}
                            onChange={(e) => setEditUser({...editUser, section: e.target.value})}
                            required
                            disabled={!editUser.strand}
                        >
                            <option value="">Select Section</option>
                            {filteredSections.map(section => (
                                <option key={section._id} value={section._id}>
                                    {section.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
            </div>

            {/* Subjects Section */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Subjects</h6>
                {availableSubjects.length > 0 ? (
                    <div className="subjects-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '0.5rem' 
                    }}>
                        {availableSubjects.map(subject => (
                            <Form.Check
                                key={subject._id}
                                type="checkbox"
                                id={`edit-${subject._id}`}
                                label={subject.name}
                                checked={editUser.subjects.includes(subject._id)}
                                onChange={(e) => {
                                    setEditUser(prev => ({
                                        ...prev,
                                        subjects: e.target.checked
                                            ? [...prev.subjects, subject._id]
                                            : prev.subjects.filter(id => id !== subject._id)
                                    }));
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted">
                        Please select strand, year level, and semester to view available subjects
                    </p>
                )}
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </Form>
    </Modal.Body>
    <Modal.Footer style={modalStyles.modalFooter}>
        <Button variant="outline-secondary" onClick={handleEditClose}>
            <i className="bi bi-x-circle me-2"></i>Cancel
        </Button>
        <Button 
            variant="outline-success" 
            onClick={handleEditSubmit}
            disabled={loading}
        >
            {loading ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Updating...
                </>
            ) : (
                <>
                    <i className="bi bi-check-circle me-2"></i>
                    Update Student
                </>
            )}
        </Button>
    </Modal.Footer>
</Modal>
    </div> );
}
 
export default StudModals;