import React, { useState, useEffect } from 'react';
import { Table, Button, Alert, Card, InputGroup, Form, Modal, Row, Col, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import TeacherDashboardNavbar from '../TeacherComponents/TeacherDashboardNavbar';
import { useTeacherUserContext } from '../context/teacherUserContext';
import TeacherModal from '../TeacherComponents/TeacherModal';
import TeacherTable from '../TeacherComponents/TeacherTable';

const TeacherGenerateForm = () => {
    const [showModal, setShowModal] = useState(false);  // State to control the modal visibility
    const {sections, teacherAdvisoryClassId, strands, yearLevels, loading, error, fetchData, handleGenerateForm, handleSelectStudent, selectedStudent, setSelectedStudent} = useTeacherUserContext()
    const [searchTerm, setSearchTerm] = useState('');
   
    useEffect(() => {
        fetchData()
    }, [])

    const modalHandler = () => {
        setShowModal(true);
        setSelectedStudent(null); // Clear previously selected student if needed
    };
   
    // Get all students from sections with proper error handling
    const allStudents = sections ? sections.flatMap(section => 
        (section.students || []).map(student => ({
            _id: student._id,
            username: student.username,
            sectionName: section.name,
            yearLevel: section.yearLevel?.name || 'Not Set',
            strand: section.strand?.name || 'Not Set',
            isAdvisory: section.isAdvisory || false
        }))
    ) : [];

    const filteredStudents = allStudents
    .filter((student) =>
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Debug information
    console.log('Sections:', sections);
    console.log('All Students:', allStudents);
    
    return (
        <>
            <TeacherDashboardNavbar />
            <div className="container mt-4">
            <Card className="mb-4 border-0 shadow-sm">
    <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
                <div>
                    <h2 className="mb-1 fw-bold">Generate Form 137</h2>
                    <small className="text-muted">
                        Record Management
                        <OverlayTrigger
                            placement="right"
                            overlay={
                                <Tooltip>
                                    Ensure all grades and student information are encoded before generating
                                </Tooltip>
                            }
                        >
                            <i className="bi bi-info-circle text-muted ms-2"></i>
                        </OverlayTrigger>
                    </small>
                </div>
            </div>
            <InputGroup style={{ width: "250px" }}>
                <InputGroup.Text className="bg-light border-1">
                    <FaSearch className="text-muted"  />
                </InputGroup.Text>
                <Form.Control 
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-1 bg-light"
                />
            </InputGroup>
        </div>

        <div className="p-3 bg-light rounded-3">
            <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle text-warning me-3"></i>
                <p className="text-secondary mb-0">
                    In this section, you can generate the Form 137 for your students. Please ensure that you have encoded the grades for the students before generating the form.
                </p>
            </div>
        </div>
    </Card.Body>
</Card>

                {error && <Alert variant="danger">{error}</Alert>}

                {loading ? (
                    <div className="text-center my-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading sections and students...</p>
                    </div>
                ) : !sections || sections.length === 0 ? (
                    <Alert variant="info">
                        <i className="bi bi-info-circle me-2"></i>
                        No sections found. You may not have any assigned sections.
                    </Alert>
                ) : allStudents.length === 0 ? (
                    <Alert variant="info">
                        <i className="bi bi-info-circle me-2"></i>
                        No students found in your sections. The sections data may not include student information.
                    </Alert>
                ) : filteredStudents.length === 0 ? (
                    <Alert variant="info">
                        <i className="bi bi-search me-2"></i>
                        No students match your search criteria.
                    </Alert>
                ) : (
                    <TeacherTable 
                        filteredStudents={filteredStudents}
                        handleSelectStudent={handleSelectStudent}
                        modalHandler={modalHandler}
                    />
                )}

                <TeacherModal 
                    showModal={showModal} 
                    setShowModal={setShowModal} 
                    selectedStudent={selectedStudent}
                    handleGenerateForm={handleGenerateForm}
                />
            </div>
        </>
    );
};

export default TeacherGenerateForm;