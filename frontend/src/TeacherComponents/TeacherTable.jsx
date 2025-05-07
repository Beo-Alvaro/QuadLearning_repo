import { Table, Button,  Card, } from 'react-bootstrap';
import React, { useState } from 'react';
const TeacherTable = ({
    filteredStudents,
    handleSelectStudent,
    modalHandler
  }) => {

    const [sortField, setSortField] = useState('username');
    const [sortDirection, setSortDirection] = useState('asc');

    const getSortedStudents = (students) => {
      return [...students].sort((a, b) => {
          let aValue = '';
          let bValue = '';
  
          switch(sortField) {
              case 'username':
                  aValue = a.username?.toLowerCase() || '';
                  bValue = b.username?.toLowerCase() || '';
                  break;
              case 'section':
                  aValue = a.sectionName?.toLowerCase() || '';
                  bValue = b.sectionName?.toLowerCase() || '';
                  break;
              case 'yearLevel':
                  aValue = a.yearLevel?.toLowerCase() || '';
                  bValue = b.yearLevel?.toLowerCase() || '';
                  break;
              case 'strand':
                  aValue = a.strand?.toLowerCase() || '';
                  bValue = b.strand?.toLowerCase() || '';
                  break;
              default:
                  aValue = a[sortField]?.toLowerCase() || '';
                  bValue = b[sortField]?.toLowerCase() || '';
          }
  
          return sortDirection === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
      });
  };

    return ( 
      <div>
        <Card className="shadow-sm">
          <Card.Body className="p-0">
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
                setSortDirection(sortField === 'yearLevel' && sortDirection === 'asc' ? 'desc' : 'asc');
                setSortField('yearLevel');
            }}
            style={{ cursor: 'pointer' }}
        >
            Year Level {sortField === 'yearLevel' && (
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
        <th className="px-4 py-3">Action</th>
    </tr>
</thead>
              <tbody>
              {getSortedStudents(filteredStudents).map(student => (
                  <tr key={student._id}>
                    <td className="px-4 py-3 fw-medium">{student.username}</td>
                    <td className="px-4 py-3">{student.sectionName}</td>
                    <td className="px-4 py-3">{student.yearLevel}</td>
                    <td className="px-4 py-3">{student.strand}</td>
                    <td>
                      <Button
                        variant="outline-success" 
                        size="sm"
                        onClick={() => {
                          handleSelectStudent(student._id);
                          modalHandler();
                        }}
                      >
                        Select
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    );
  };
  
  export default TeacherTable;
  