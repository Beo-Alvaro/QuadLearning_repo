import React from 'react';
import { Modal, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useState } from 'react';
const AdminTeacherModals = ({
    showAddModal, 
    showEditModal, 
    showDeleteModal, setShowDeleteModal,
    newUser, setNewUser,
    editUser, setEditUser,
    availableSubjects, sections, semesters, advisorySections,
    loading, error, handleAddUser, handleEditSubmit, handleEditClose, deleteHandler, selectedUserId, handleClose, validations, setValidations
}) => {
    const TEACHER_USERNAME_MAX_LENGTH = 30; // Set max length for username
    const [showPassword, setShowPassword] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);
    const handleCheckboxChange = (e, field, value) => {
        const currentSelections = newUser[field] || [];
        setNewUser({
          ...newUser,
          [field]: e.target.checked
            ? [...currentSelections, value]
            : currentSelections.filter(item => item !== value)
        });
      };
    const modalStyles = {
        modal: {
            maxWidth: '800px',
            margin: '1.75rem auto',
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
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
    
    return (
        <>
            {/* Add Modal */}
            <Modal
                show={showAddModal}
                onHide={handleClose}
                size="lg"
                centered
            >
                <Modal.Header closeButton style={modalStyles.modalHeader}>
                    <Modal.Title>
                        <i className="bi bi-person-plus-fill me-2"></i>
                        Add New Teacher Account
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleAddUser}>
                        {/* Basic Information Section */}
                        <div style={{ ...modalStyles.formSection, ...modalStyles.fullWidth }}>
                            <h6 className="mb-3">Basic Information
                            <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip className='custom-tooltip'>All fields in Basic Information are required.</Tooltip>}
                                >
                                    <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                            </OverlayTrigger>
                            </h6>
                            <div style={modalStyles.formGrid}>
                                <Form.Group>
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        required
                                        style={{ borderColor: '#ced4da' }} // Override default validation styling
                                        maxLength={TEACHER_USERNAME_MAX_LENGTH} // Set max length for username
                                    />
                                </Form.Group>
                                <Form.Group>
    <Form.Label>Password</Form.Label>
    <div className="position-relative">
        <Form.Control
            type={showPassword ? "text" : "password"}
            value={newUser.password}
            onChange={(e) => {
                setNewUser({ ...newUser, password: e.target.value });
                if (!showRequirements) setShowRequirements(true);
            }}
            onFocus={() => setShowRequirements(true)}
            required
            style={{ borderColor: '#ced4da' }}
        />
        <Button
            className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            type="button"
        >
            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-success`}></i>
        </Button>
    </div>
    {showRequirements && (
        <div className="password-requirements mb-3">
            <small className={`d-block ${validations.minLength ? 'text-success' : 'text-danger'}`}>
                <i className={`bi ${validations.minLength ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                {' '}Minimum 8 characters
            </small>
            <small className={`d-block ${validations.hasUppercase ? 'text-success' : 'text-danger'}`}>
                <i className={`bi ${validations.hasUppercase ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                {' '}One uppercase letter
            </small>
            <small className={`d-block ${validations.hasNumber ? 'text-success' : 'text-danger'}`}>
                <i className={`bi ${validations.hasNumber ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                {' '}One number
            </small>
            <small className={`d-block ${validations.hasSymbol ? 'text-success' : 'text-danger'}`}>
                <i className={`bi ${validations.hasSymbol ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                {' '}One special character
            </small>
        </div>
    )}
</Form.Group>
                            </div>
                        </div>

                      {/* Teaching Assignment Section */}
<div style={{ ...modalStyles.formSection, ...modalStyles.fullWidth }}>
    <h6 className="mb-3">Teaching Assignment
                        <OverlayTrigger
                                placement="right"
                                overlay={<Tooltip className='custom-tooltip'>All fields in Teaching Assignment are required.</Tooltip>}
                            >
                                <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                        </OverlayTrigger>
    </h6>
    <div style={modalStyles.formGrid}>
        <Form.Group>
            <Form.Label>Sections</Form.Label>
            <Form.Select
                multiple
                value={newUser.sections}
                onChange={(e) => setNewUser({
                    ...newUser,
                    sections: Array.from(e.target.selectedOptions, option => option.value)
                })}
                required
            >
                {sections.map((section) => (
                    <option key={section._id} value={section._id}>
                        {section.name} - {section.yearLevel?.name || 'No Year Level'}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>

        <Form.Group>
            <Form.Label>Advisory Section</Form.Label>
            <Form.Select
                value={newUser.advisorySection}
                onChange={(e) => setNewUser({ ...newUser, advisorySection: e.target.value })}
            >
                <option value="">Select Advisory Section (Optional)</option>
                {advisorySections
                    .filter(section =>
                        (!section.hasAdviser || section._id === newUser.advisorySection) &&
                        section.status === 'active'
                    )
                    .map((section) => (
                        <option key={section._id} value={section._id}>
                            {section.name} - {section.yearLevel?.name || 'No Year Level'}
                        </option>
                    ))}
            </Form.Select>
        </Form.Group>

        <Form.Group>
            <Form.Label>Semesters</Form.Label>
            <Form.Select
                multiple
                value={newUser.semesters}
                onChange={(e) => setNewUser({
                    ...newUser,
                    semesters: Array.from(e.target.selectedOptions, option => option.value)
                })}
                required
            >
                {semesters
                    .filter(semester => semester.status === 'active')
                    .map((semester) => (
                        <option key={semester._id} value={semester._id}>
                            {`${semester.name} - ${semester.strand?.name || 'Unknown Strand'} - ${semester.yearLevel?.name || 'Unknown Year Level'}`}
                        </option>
                    ))
                }
            </Form.Select>
        </Form.Group>
    </div>
</div>                 

                      {/* Subjects Section */}
 <div style={{ ...modalStyles.formSection, ...modalStyles.fullWidth }}>
     <h6 className="mb-3">Subject Assignment
     <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip className='custom-tooltip'>Subjects are required to proceed.</Tooltip>}
                                >
                                    <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                            </OverlayTrigger>
     </h6>
     {availableSubjects.length > 0 && (
         <Form.Check
             type="checkbox"
             label="Select All"
             onChange={(e) => {
                 const allSubjects = availableSubjects.map(subject => subject._id);
                 setNewUser({
                     ...newUser,
                     subjects: e.target.checked ? allSubjects : []
                 });
             }}
             checked={
                 availableSubjects.length > 0 &&
                 newUser.subjects.length === availableSubjects.length
             }
         />
     )}
     <div className="subjects-grid" style={{ 
         display: 'grid', 
         gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
         gap: '0.5rem' 
     }}>
         {availableSubjects.length > 0 ? (
             availableSubjects.map((subject) => (
                 <Form.Check
                     key={subject._id}
                     type="checkbox"
                     label={subject.name}
                     checked={newUser.subjects?.includes(subject._id)}
                     onChange={(e) => handleCheckboxChange(e, 'subjects', subject._id)}
                     disabled={!newUser.sections.length || !newUser.semesters.length}
                 />
             ))
         ) : (
             <p className="text-muted">
                 Please select sections and semesters to view available subjects
             </p>
         )}
     </div>
 </div>

                        {error && <div className="alert alert-danger mt-3">{error}</div>}
                    </Form>
                </Modal.Body>
                <Modal.Footer style={modalStyles.modalFooter}>
                    <Button variant="secondary" onClick={handleClose}>
                        <i className="bi bi-x-circle me-2"></i>Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddUser} disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle me-2"></i>
                                Add Teacher
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Modal */}
            <Modal
                show={showEditModal}
                onHide={handleEditClose}
                size="lg"
                centered
            >
                <Modal.Header closeButton style={modalStyles.modalHeader}>
                    <Modal.Title>
                        <i className="bi bi-pencil-square me-2"></i>
                        Edit Teacher Account
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleEditSubmit}>
                        {/* Teaching Assignment Section */}
                        <div style={{ ...modalStyles.formSection, ...modalStyles.fullWidth }}>
                            <h6 className="mb-3">Teaching Assignment
                            <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip className='custom-tooltip'>All fields in Teaching Assignment are required.</Tooltip>}
                                >
                                    <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                            </OverlayTrigger>
                            </h6>
                            <div style={modalStyles.formGrid}>
                                <Form.Group>
                                    <Form.Label>Sections</Form.Label>
                                    <Form.Select
                                        multiple
                                        value={editUser.sections}
                                        onChange={(e) => setEditUser({
                                            ...editUser,
                                            sections: Array.from(e.target.selectedOptions, option => option.value)
                                        })}
                                        required
                                    >
                                        {sections.map((section) => (
                                            <option key={section._id} value={section._id}>
                                                {section.name} - {section.yearLevel.name || 'No Year Level'}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group>
    <Form.Label>Advisory Section</Form.Label>
    <Form.Select
        value={editUser.advisorySection}
        onChange={(e) => setEditUser({
            ...editUser,
            advisorySection: e.target.value
        })}
    >
        <option value="">Select Advisory Section (Optional)</option>
        {advisorySections
            .filter(section => 
                (!section.hasAdviser || section._id === editUser.advisorySection) && 
                section.status === 'active'
            )
            .map((section) => (
                <option key={section._id} value={section._id}>
                    {section.name} - {section.yearLevel?.name || 'No Year Level'}
                </option>
            ))}
    </Form.Select>
</Form.Group>

                                <Form.Group>
                                    <Form.Label>Semesters</Form.Label>
                                    <Form.Select
                                        multiple
                                        value={editUser.semesters}
                                        onChange={(e) => setEditUser({
                                            ...editUser,
                                            semesters: Array.from(e.target.selectedOptions, option => option.value)
                                        })}
                                        required
                                    >
                                        {semesters
                                            .filter(semester => semester.status === 'active')
                                            .map((semester) => (
                                                <option key={semester._id} value={semester._id}>
                                            {`${semester.name} - ${semester.strand?.name || 'Unknown Strand'} - ${semester.yearLevel?.name || 'Unknown Year Level'}`}
                                                </option>
                                            ))
                                        }
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        {/* Subjects Section */}
 <div style={{ ...modalStyles.formSection, ...modalStyles.fullWidth }}>
     <h6 className="mb-3">Subject Assignment
     <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip className='custom-tooltip'>Subjects are required to proceed.</Tooltip>}
                                >
                                    <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                            </OverlayTrigger>
     </h6>
     <Form.Group>
         <Form.Label>Subjects</Form.Label>
         {loading ? (
             <p>Loading subjects...</p>
         ) : availableSubjects.length > 0 ? (
             <>
                 <div className="mb-2">
                     <Form.Check 
                         type="checkbox"
                         label="Select All"
                         onChange={(e) => {
                             setEditUser({
                                 ...editUser,
                                 subjects: e.target.checked
                                     ? availableSubjects.map(subject => subject._id)
                                     : []
                             });
                         }}
                         checked={
                             availableSubjects.length > 0 &&
                             editUser.subjects.length === availableSubjects.length
                         }
                     />
                 </div>
                 <Form.Select
                     multiple
                     value={editUser.subjects}
                     onChange={(e) => setEditUser({
                         ...editUser,
                         subjects: Array.from(e.target.selectedOptions, option => option.value)
                     })}
                     required
                 >
                     {availableSubjects.map((subject) => (
                         <option key={subject._id} value={subject._id}>
                             {subject.name}
                         </option>
                     ))}
                 </Form.Select>
             </>
         ) : (
             <p className="text-muted">
                 {editUser.sections.length === 0 || editUser.semesters.length === 0
                     ? "Please select sections and semesters to view available subjects"
                     : "No subjects available for the selected sections and semesters"}
             </p>
         )}
     </Form.Group>
 </div>

                        {error && <div className="alert alert-danger mt-3">{error}</div>}
                    </Form>
                </Modal.Body>
                <Modal.Footer style={modalStyles.modalFooter}>
                    <Button variant="secondary" onClick={handleEditClose}>
                        <i className="bi bi-x-circle me-2"></i>Cancel
                    </Button>
                    <Button variant="primary" onClick={handleEditSubmit} disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle me-2"></i>
                                Update Teacher
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Modal */}
            <Modal show={showDeleteModal} onHide={setShowDeleteModal} centered>
                <Modal.Body style={modalStyles.deleteModal}>
                    <div style={modalStyles.deleteIcon}>
                        <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>
                    <h4 className="mb-3">Confirm Deletion</h4>
                    <p className="text-muted">
                        Are you sure you want to delete this teacher account? This action cannot be undone.
                    </p>
                </Modal.Body>
                <Modal.Footer style={modalStyles.modalFooter} className="justify-content-center">
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        <i className="bi bi-x-circle me-2"></i>Cancel
                    </Button>
                    <Button variant="danger" onClick={() => deleteHandler(selectedUserId)}>
                        <i className="bi bi-trash me-2"></i>Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AdminTeacherModals;
