import { Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useState } from 'react';
const SubjectTable = ({
    handleEditShow,
    handleShow,
    studSubjects
  }) => {
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSubjects = Array.isArray(studSubjects)
    ? studSubjects.filter((subject) => subject.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];  // If it's not an array, return an empty array

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const totalPages = Math.ceil(filteredSubjects.length / entriesPerPage);
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredSubjects.slice(indexOfFirstEntry, indexOfLastEntry);
  
    return (
      <div>
        <h2 className="my-4">Subjects List</h2>
  
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* Entries Dropdown */}
          <div className="d-flex align-items-center">
            <span>Show</span>
            <Form.Select
              size="sm"
              className="mx-2"
              style={{ width: 'auto' }}
              value={entriesPerPage}
              onChange={(e) => handlePageChange(e.target.value, 'entries')}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
            <span>entries</span>
          </div>
  
          {/* Search Input */}
          <div className="d-flex align-items-center">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search Subject Name"
                value={searchTerm}
                onChange={(e) => handlePageChange(e.target.value, 'search')}
              />
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
            </InputGroup>
          </div>
        </div>
  
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="custom-table text-center align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Subject Name</th>
                  <th>Subject Code</th>
                  <th>Strand</th>
                  <th>Year Level</th>
                  <th>Semester</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.map((subject) => (
                  <tr key={subject._id}>
                    <td>{subject.name}</td>
                    <td>{subject.code}</td>
                    <td>{subject.strand?.name}</td>
                    <td>{subject.yearLevel?.name}</td>
                    <td>{`${subject.semester?.name} - ${subject.semester?.strand?.name || ''}`}</td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="btn-action"
                          onClick={() => handleEditShow(subject._id)}
                        >
                          <i className="bi bi-pencil-square me-1"></i>
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="btn-action"
                          onClick={() => handleShow(subject._id)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
  
        <div className="d-flex justify-content-between mt-3">
          <Button
            variant="outline-primary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange('prev')}
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline-primary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange('next')}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };
  
  export default SubjectTable;
  