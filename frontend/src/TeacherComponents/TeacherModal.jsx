import { Table, Button,  Card, Modal, Badge } from 'react-bootstrap';
const TeacherModal = ({
    showModal,
    setShowModal,
    selectedStudent,
    handleGenerateForm
  }) => {
    return ( 
        <div>
            
                {/* Modal for displaying student details */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Student Information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    {selectedStudent && (
    <div className="student-details-container bg-white rounded-4 p-4 border">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0 text-dark fw-bold">
                <i className="bi bi-person-vcard text-primary me-2"></i>
                Student Profile
            </h3>
            <Badge bg="secondary" className="px-3 py-2">
                ID: {selectedStudent._id}
            </Badge>
        </div>
        
        <div className="row g-4">
            <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                    <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-person-circle text-primary me-2 fs-4"></i>
                        <h5 className="mb-0 text-muted">Personal Information</h5>
                    </div>
                    <div className="row">
                        <div className="col-4 text-muted">Full Name:</div>
                        <div className="col-8 fw-bold">
                            {`${selectedStudent.firstName || ''} ${selectedStudent.middleInitial || ''} ${selectedStudent.lastName || ''}`}
                        </div>
                    </div>
                    <hr className="my-2"/>
                    <div className="row">
                        <div className="col-4 text-muted">Gender:</div>
                        <div className="col-8">{selectedStudent.gender}</div>
                    </div>
                    <hr className="my-2"/>
                    <div className="row">
                        <div className="col-4 text-muted">Birthdate:</div>
                        <div className="col-8">{selectedStudent.birthdate}</div>
                    </div>
                </div>
            </div>
            
            <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                    <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-mortarboard text-success me-2 fs-4"></i>
                        <h5 className="mb-0 text-muted">Academic Details</h5>
                    </div>
                    <div className="row">
                        <div className="col-4 text-muted">Section:</div>
                        <div className="col-8 fw-bold">{selectedStudent.section}</div>
                    </div>
                    <hr className="my-2"/>
                    <div className="row">
                        <div className="col-4 text-muted">Year Level:</div>
                        <div className="col-8">{selectedStudent.yearLevel}</div>
                    </div>
                    <hr className="my-2"/>
                    <div className="row">
                        <div className="col-4 text-muted">Strand:</div>
                        <div className="col-8">{selectedStudent.strand}</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4">
            <div className="d-flex align-items-center mb-3">
                <i className="bi bi-journal-text text-info me-2 fs-4"></i>
                <h4 className="mb-0 text-muted">Academic Performance</h4>
            </div>
        
            {selectedStudent.grades && selectedStudent.grades.length > 0 ? (
                (() => {
                    // Group grades by semester ID
                    const semesterGroups = {};
                    
                    selectedStudent.grades.forEach(gradeEntry => {
                        const semesterId = gradeEntry.semester?._id || 
                                          (typeof gradeEntry.semester === 'string' ? gradeEntry.semester : 'unknown');
                        
                        if (!semesterGroups[semesterId]) {
                            semesterGroups[semesterId] = {
                                semesterInfo: gradeEntry.semester,
                                schoolYear: gradeEntry.schoolYear,
                                subjects: []
                            };
                        }
                        
                        // Add all subjects from this grade entry to the semester group
                        gradeEntry.subjects.forEach(subject => {
                            semesterGroups[semesterId].subjects.push(subject);
                        });
                    });
                    
                    // Render each semester group
                    return Object.entries(semesterGroups).map(([semesterId, group], index) => (
                        <div key={semesterId} className="mb-4">
                            <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-calendar-event text-primary me-2"></i>
                                <h5 className="mb-0">
                                    {group.semesterInfo ? (
                                        typeof group.semesterInfo === 'object' ? 
                                            group.semesterInfo.name : 
                                            'Semester'
                                    ) : 'Semester'} 
                                    {group.schoolYear ? ` - ${group.schoolYear}` : ''}
                                </h5>
                            </div>
                            
                            <Card className="border shadow-sm">
                                <Table responsive hover className='mb-0 text-center'>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Subject</th>
                                            <th>Midterm</th>
                                            <th>Finals</th>
                                            <th>Final Rating</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.subjects.map((subject, idx) => (
                                            <tr key={idx} 
                                                className={subject.finalRating < 75 ? 'table-warning' : ''}>
                                                <td>{subject.subject ? (
                                                    typeof subject.subject === 'object' ? 
                                                        subject.subject.name : 
                                                        subject.subjectName || 'Unknown'
                                                ) : subject.subjectName || 'Unknown'}</td>
                                                <td>{subject.midterm || '-'}</td>
                                                <td>{subject.finals || '-'}</td>
                                                <td>{subject.finalRating || '-'}</td>
                                                <td>
                                                    <Badge 
                                                        bg={subject.finalRating >= 75 ? 'success' : 'danger'}
                                                        className="px-2 py-1"
                                                    >
                                                        {subject.action || (subject.finalRating >= 75 ? 'PASSED' : 'FAILED')}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card>
                        </div>
                    ));
                })()
            ) : (
                <div className="text-center p-4 border rounded-3">
                    <i className="bi bi-exclamation-circle text-muted fs-1"></i>
                    <p className="mt-2">No grades available for this student.</p>
                </div>
            )}
        </div>

        <div className="text-center mt-4">
            <Button 
                variant="outline-success" 
                onClick={() => handleGenerateForm(selectedStudent._id)}
                className="px-4 py-2"
            >
                <i className="bi bi-file-earmark-arrow-down me-2"></i>
                Generate Official Form 137
            </Button>
        </div>
    </div>
)}
                    </Modal.Body>
                </Modal>
        </div>
     );
}
 
export default TeacherModal;