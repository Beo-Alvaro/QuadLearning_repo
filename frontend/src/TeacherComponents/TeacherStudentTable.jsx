import { Card, Table, Alert, Button, Badge } from 'react-bootstrap';
import React, { useState } from 'react';
const TeacherStudentTable = ({ filteredStudents, showAdvisoryOnly, handleViewStudent }) => {
    const [sortField, setSortField] = useState('username');
    const [sortDirection, setSortDirection] = useState('asc');

    const getSortedStudents = (students) => {
        return [...students].sort((a, b) => {
            let aValue = '';
            let bValue = '';

            switch(sortField) {
                case 'username':
                    aValue = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
                    bValue = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
                    break;
                case 'section':
                    aValue = a.sectionName?.toLowerCase() || '';
                    bValue = b.sectionName?.toLowerCase() || '';
                    break;
                case 'strand':
                    aValue = a.strandName?.toLowerCase() || '';
                    bValue = b.strandName?.toLowerCase() || '';
                    break;
                case 'yearLevel':
                    aValue = a.yearLevelName?.toLowerCase() || '';
                    bValue = b.yearLevelName?.toLowerCase() || '';
                    break;
                case 'advisory':
                    return sortDirection === 'asc' 
                        ? (a.isAdvisory === b.isAdvisory ? 0 : a.isAdvisory ? -1 : 1)
                        : (a.isAdvisory === b.isAdvisory ? 0 : a.isAdvisory ? 1 : -1);
                default:
                    aValue = a[sortField]?.toLowerCase() || '';
                    bValue = b[sortField]?.toLowerCase() || '';
            }

            return sortDirection === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });
    };

    const sortedStudents = getSortedStudents(filteredStudents);

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
                                    <th 
                                        className="px-4 py-3" 
                                        onClick={() => {
                                            setSortDirection(sortField === 'username' && sortDirection === 'asc' ? 'desc' : 'asc');
                                            setSortField('username');
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Student Name {sortField === 'username' && (
                                            <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                                        )}
                                    </th>
                                    <th 
                                        className="px-4 py-3"
                                        onClick={() => {
                                            setSortDirection(sortField === 'section' && sortDirection === 'asc' ? 'desc' : 'asc');
                                            setSortField('section');
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Section {sortField === 'section' && (
                                            <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                                        )}
                                    </th>
                                    <th 
                                        className="px-4 py-3"
                                        onClick={() => {
                                            setSortDirection(sortField === 'strand' && sortDirection === 'asc' ? 'desc' : 'asc');
                                            setSortField('strand');
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Strand {sortField === 'strand' && (
                                            <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                                        )}
                                    </th>
                                    <th 
                                        className="px-4 py-3"
                                        onClick={() => {
                                            setSortDirection(sortField === 'yearLevel' && sortDirection === 'asc' ? 'desc' : 'asc');
                                            setSortField('yearLevel');
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Year Level {sortField === 'yearLevel' && (
                                            <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                                        )}
                                    </th>
                                    {!showAdvisoryOnly && (
                                        <th 
                                            className="px-4 py-3"
                                            onClick={() => {
                                                setSortDirection(sortField === 'advisory' && sortDirection === 'asc' ? 'desc' : 'asc');
                                                setSortField('advisory');
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Advisory Student {sortField === 'advisory' && (
                                                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                                            )}
                                        </th>
                                    )}
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                        <tbody>
                            {sortedStudents.map((student) => (
                                <tr key={student._id}>
                                    <td className="px-4 py-3 fw-medium">
                                        {`${student.firstName || ''} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName || ''}`.trim()}
                                    </td>
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
    onClick={() => {
        console.log('Student data:', student);
        // Ensure we're passing the correct user ID
        // User ID might be stored in different properties depending on API response format
        const userId = student.user?._id || student.user || student._id;
        console.log('Passing user ID to handleViewStudent:', userId);
        handleViewStudent(userId);
    }}
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