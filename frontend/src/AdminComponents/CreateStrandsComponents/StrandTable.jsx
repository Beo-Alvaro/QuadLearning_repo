import { Card, Table, Button, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useState } from 'react';

const StrandTable = ({
    handleEditShow,
    studStrands,
    handleDeleteShow
}) => {
    // States for search, pagination, and entries per page
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const SEARCH_MAX_LENGTH = 30;
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const getSortedStrands = (strands) => {
        return [...strands].sort((a, b) => {
            let aValue = a[sortField]?.toLowerCase() || '';
            let bValue = b[sortField]?.toLowerCase() || '';
            
            return sortDirection === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });
    };

    // Filter and Paginate Data
    const filteredStrands = studStrands.filter((strand) =>
        strand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strand.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredStrands.length / entriesPerPage);

    const sortedAndFilteredStrands = getSortedStrands(filteredStrands);

    const paginatedStrands = sortedAndFilteredStrands.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div>
            <h2 className="my-4">Strands List</h2>

            {/* Entries and Search */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                    <span>Show</span>
                    <Form.Select
                        size="sm"
                        className="mx-2"
                        style={{ width: 'auto' }}
                        value={entriesPerPage}
                        onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </Form.Select>
                    <span>entries</span>
                </div>

                {/* Search */}
                <InputGroup style={{ width: '500px' }}>
                    <InputGroup.Text>
                        <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Search for a strand (e.g., TVL)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        maxLength={SEARCH_MAX_LENGTH}
                    />
                </InputGroup>
            </div>

            {/* Table */}
            <Card className="shadow-sm">
                <Card.Body className="p-0">
                    <Table responsive hover className='custom-table text-center align-middle'>
<thead className="bg-light">
                <tr>
                    <th onClick={() => {
                        setSortDirection(sortField === 'name' && sortDirection === 'asc' ? 'desc' : 'asc');
                        setSortField('name');
                    }} style={{ cursor: 'pointer' }}>
                        Name {sortField === 'name' && (
                            <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                    </th>
                    <th onClick={() => {
                        setSortDirection(sortField === 'description' && sortDirection === 'asc' ? 'desc' : 'asc');
                        setSortField('description');
                    }} style={{ cursor: 'pointer' }}>
                        Description {sortField === 'description' && (
                            <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                    </th>
                    <th>Actions</th>
                </tr>
            </thead>
                        <tbody className='text-center'>
                            {paginatedStrands.length > 0 ? (
                                paginatedStrands.map((strand) => (
                                    <tr key={strand._id}>
                                        <td>{strand.name}</td>
                                        <td>{strand.description}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    className="btn-action"
                                                    onClick={() => handleEditShow(strand._id)}
                                                >
                                                    <i className="bi bi-pencil-square me-1"></i>
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="btn-action"
                                                    onClick={() => handleDeleteShow(strand._id)}
                                                >
                                                    <i className="bi bi-trash me-1"></i>
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center">No results found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Pagination */}
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

export default StrandTable;
