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
    const MAX_SEARCH_LENGTH = 30;

    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const getSortedSubjects = (subjects) => {
      return [...subjects].sort((a, b) => {
          let aValue = '';
          let bValue = '';
  
          // Handle nested properties
          switch(sortField) {
              case 'strand':
                  aValue = a.strand?.name?.toLowerCase() || '';
                  bValue = b.strand?.name?.toLowerCase() || '';
                  break;
              case 'yearLevel':
                  aValue = a.yearLevel?.name?.toLowerCase() || '';
                  bValue = b.yearLevel?.name?.toLowerCase() || '';
                  break;
              case 'semester':
                  aValue = a.semester?.name?.toLowerCase() || '';
                  bValue = b.semester?.name?.toLowerCase() || '';
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

  const filteredAndSortedSubjects = getSortedSubjects(
    Array.isArray(studSubjects)
        ? studSubjects.filter((subject) => 
            subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subject.code.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : []
);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleSearch = (value) => {
      setSearchTerm(value);
      setCurrentPage(1); // Reset to first page when searching
  };

  const totalPages = Math.ceil(filteredAndSortedSubjects.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredAndSortedSubjects.slice(indexOfFirstEntry, indexOfLastEntry);
  
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
                        placeholder="Search subject by name or code (e.g., Math 101)"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        maxLength={MAX_SEARCH_LENGTH}
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
        <th onClick={() => {
            setSortDirection(sortField === 'name' && sortDirection === 'asc' ? 'desc' : 'asc');
            setSortField('name');
        }} style={{ cursor: 'pointer' }}>
            Subject Name {sortField === 'name' && (
                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
            )}
        </th>
        <th onClick={() => {
            setSortDirection(sortField === 'code' && sortDirection === 'asc' ? 'desc' : 'asc');
            setSortField('code');
        }} style={{ cursor: 'pointer' }}>
            Subject Code {sortField === 'code' && (
                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
            )}
        </th>
        <th onClick={() => {
            setSortDirection(sortField === 'strand' && sortDirection === 'asc' ? 'desc' : 'asc');
            setSortField('strand');
        }} style={{ cursor: 'pointer' }}>
            Strand {sortField === 'strand' && (
                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
            )}
        </th>
        <th onClick={() => {
            setSortDirection(sortField === 'yearLevel' && sortDirection === 'asc' ? 'desc' : 'asc');
            setSortField('yearLevel');
        }} style={{ cursor: 'pointer' }}>
            Year Level {sortField === 'yearLevel' && (
                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
            )}
        </th>
        <th onClick={() => {
            setSortDirection(sortField === 'semester' && sortDirection === 'asc' ? 'desc' : 'asc');
            setSortField('semester');
        }} style={{ cursor: 'pointer' }}>
            Semester {sortField === 'semester' && (
                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
            )}
        </th>
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
  