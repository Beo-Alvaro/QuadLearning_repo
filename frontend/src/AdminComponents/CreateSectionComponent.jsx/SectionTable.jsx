import { Card, Form, Button, Table } from 'react-bootstrap';
import { useState } from 'react';
import { FaSearch } from "react-icons/fa";
const SectionTable = ({
    handleEditShow,
    handleShow,
    studSections
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const getSortedSections = (sections) => {
        return [...sections].sort((a, b) => {
            let aValue = '';
            let bValue = '';

            // Handle nested properties for strand and yearLevel
            if (sortField === 'strand') {
                aValue = a.strand?.name?.toLowerCase() || '';
                bValue = b.strand?.name?.toLowerCase() || '';
            } else if (sortField === 'yearLevel') {
                aValue = a.yearLevel?.name?.toLowerCase() || '';
                bValue = b.yearLevel?.name?.toLowerCase() || '';
            } else {
                aValue = a[sortField]?.toLowerCase() || '';
                bValue = b[sortField]?.toLowerCase() || '';
            }
            
            return sortDirection === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });
    };

    const filteredSections = studSections.filter((section) =>
        section.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedAndFilteredSections = getSortedSections(filteredSections);

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredSections.slice(indexOfFirstEntry, indexOfLastEntry);

    const totalPages = Math.ceil(filteredSections.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const MAX_SEARCH_LENGTH = 30;

    return ( 
        <div>
            <h2 className="my-4">Section List</h2>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                    <Form.Select
                        value={entriesPerPage}
                        onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
                        style={{ width: '150px' }}
                    >
                        <option value={10}>10 Entries</option>
                        <option value={25}>25 Entries</option>
                        <option value={50}>50 Entries</option>
                    </Form.Select>
                </div>
                <Form.Control
                    type="text"
                    placeholder="Search for a section (e.g., TVL 101)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '450px' }}
                    maxLength={MAX_SEARCH_LENGTH}
                />
                <Button variant="outline-secondary">
                    <FaSearch />
                </Button>
            </div>

            <Card className="shadow-sm">
                <Card.Body className="p-0">
                    <Table responsive hover className='custom-table text-center align-middle'>
                    <thead className="bg-light">
                    <tr className='text-center'>
                        <th onClick={() => {
                            setSortDirection(sortField === 'name' && sortDirection === 'asc' ? 'desc' : 'asc');
                            setSortField('name');
                        }} style={{ cursor: 'pointer' }}>
                            Section Name {sortField === 'name' && (
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
                        <th>Actions</th>
                    </tr>
                </thead>
                        <tbody className='text-center'>
                            {sortedAndFilteredSections.map((section) => (
                                <tr key={section._id}>
                                    <td>{section.name}</td>
                                    <td>{section.strand ? section.strand.name : 'N/A'}</td>
                                    <td>{section.yearLevel ? section.yearLevel.name : 'N/A'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <Button variant="outline-success" size="sm" onClick={() => handleEditShow(section._id)}>
                                                <i className="bi bi-pencil-square me-1"></i>
                                                Edit
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleShow(section._id)}>
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
                <Button variant="outline-primary" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange('prev')}>
                    Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button variant="outline-primary" size="sm" disabled={currentPage === totalPages} onClick={() => handlePageChange('next')}>
                    Next
                </Button>
            </div>
        </div>
    );
}

export default SectionTable;
