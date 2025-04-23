import { Card, Table, Alert, Button, Badge } from 'react-bootstrap';

const TeacherStudentTable = ({ filteredStudents, showAdvisoryOnly, handleViewStudent }) => {
    return ( 
        <div>
             {/* Students Table Section */}
        <Card className="shadow-sm">
            <Card.Body className="p-0">
                {filteredStudents.length === 0 ? (
                    <Alert variant="info" className="m-4">
                        <i className="bi bi-info-circle me-2"></i>
                        {showAdvisoryOnly 
                            ? "No advisory students found."
                            : "No students found for the selected filters."}
                    </Alert>
                ) : (
                    <Table responsive hover className='custom-table text-center align-middle'>
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3">Student Name</th>
                                <th className="px-4 py-3">Section</th>
                                <th className="px-4 py-3">Strand</th>
                                <th className="px-4 py-3">Year Level</th>
                                {!showAdvisoryOnly && <th className="px-4 py-3">Advisory Student</th>}
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student._id}>
                                    <td className="px-4 py-3 fw-medium">{student.username}</td>
                                    <td className="px-4 py-3">{student.sectionName}</td>
                                    <td className="px-4 py-3">{student.strandName}</td>
                                    <td className="px-4 py-3">{student.yearLevelName}</td>
                                    {!showAdvisoryOnly && (
                                        <td className="px-4 py-3">
                                            <Badge bg={student.isAdvisory ? 'success' : 'secondary'}>
                                                {student.isAdvisory ? 'Yes' : 'No'}
                                            </Badge>
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-center">
                                    <Button 
    variant="outline-success" 
    size="sm"
    onClick={() => handleViewStudent(student.user || student._id)} // Update this line
    className="action-button"
>
    <i className="bi bi-eye me-1"></i>
    View Details
</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
        </div>
     );
}
 
export default TeacherStudentTable;