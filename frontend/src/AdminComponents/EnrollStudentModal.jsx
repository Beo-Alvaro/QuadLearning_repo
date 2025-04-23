import { Modal, Button, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
const EnrollStudentModal = ({ show, onClose, newUser, setNewUser, yearLevels, strands, filteredSections, semesters, error, subjects, setPendingStudents, pendingStudents, setError}) => {
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const modalStyles = {
        modalHeader: {
            background: '#f8f9fa',
            borderBottom: '2px solid #dee2e6',
            padding: '1rem 1.5rem'
        },
        modalFooter: {
            background: '#f8f9fa',
            borderTop: '2px solid #dee2e6',
            padding: '1rem 1.5rem'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem'
        },
        formSection: {
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
        }
    };

    const handleEnroll = async (userId) => {
        const token = localStorage.getItem('token');
        console.log('Form data being sent:', newUser); // Debugging log
        try {
            const response = await fetch('/api/admin/enroll-student', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: userId, // Ensure this is not undefined
                    section: newUser.section,
                    strand: newUser.strand,
                    subjects: newUser.subjects,
                    yearLevel: newUser.yearLevel,
                    semester: newUser.semester,
                }),
            });    
            const data = await response.json();
            console.log('Server response:', data); // Debugging log
            if (response.ok) {
                // Make sure setPendingStudents and pendingStudents are passed as props if used
                if (setPendingStudents && pendingStudents) {
                    setPendingStudents(pendingStudents.filter(pending => pending._id !== userId));
                }
                onClose(); // Close modal
                toast.success('Student enrolled successfully!')
            } else {
                setError(data.message || 'Failed to enroll student');
            }
        } catch (error) {
            setError('Error enrolling student');
            console.error('Error enrolling student:', error);
        }
    };
    
    const handleInputChange = (field, value) => {
        setNewUser({ ...newUser, [field]: value });
    };

    useEffect(() => {
        if (newUser.strand && newUser.semester && newUser.yearLevel) {
            const filteredSubjects = subjects.filter(subject =>
                subject?.strand?._id === newUser.strand &&
                subject?.semester?._id === newUser.semester &&
                subject?.yearLevel?._id === newUser.yearLevel
            );
            setAvailableSubjects(filteredSubjects);
        } else {
            setAvailableSubjects([]);
        }
    }, [newUser.strand, newUser.semester, newUser.yearLevel, subjects]);

    const handleSubmit = (e) => {
        e.preventDefault();
        handleEnroll(newUser._id); // Pass userId when calling handleEnroll
    };
    

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton style={modalStyles.modalHeader}>
                <Modal.Title>Enroll Student</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <div style={modalStyles.formSection}>
                        <h6>Academic Information</h6>
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
                                    value={newUser.strand}
                                    onChange={(e) => handleInputChange('strand', e.target.value)}
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
                // More comprehensive filtering
                const hasValidStrand = semester.strand && 
                    (typeof semester.strand === 'object' 
                        ? semester.strand._id === newUser.strand 
                        : semester.strand === newUser.strand);
                
                const hasValidYearLevel = semester.yearLevel && 
                    (typeof semester.yearLevel === 'object' 
                        ? semester.yearLevel._id === newUser.yearLevel 
                        : semester.yearLevel === newUser.yearLevel);
                const isActive = semester.status === 'active' || semester.isActive === true;
                return hasValidStrand && hasValidYearLevel && isActive;
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
                                    onChange={(e) => handleInputChange('section', e.target.value)}
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
                ) : (
                    <p className="text-muted">
                        Please select strand, year level, and semester to view available subjects
                    </p>
                )}
            </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <Modal.Footer style={modalStyles.modalFooter}>
                        <Button variant="outline-secondary" onClick={onClose}>Cancel</Button>
                        <Button variant="outline-success" type="submit">Enroll Student</Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EnrollStudentModal;
