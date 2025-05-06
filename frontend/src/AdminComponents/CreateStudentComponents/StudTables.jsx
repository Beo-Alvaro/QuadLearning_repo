import React from 'react';
import { Table, Form, InputGroup, Button } from 'react-bootstrap'
import { FaSearch } from 'react-icons/fa';
const StudTables = ({
    selectedStrand,
    setSelectedStrand,
    selectedSection,
    setSelectedSection,
    searchTerm,
    setSearchTerm,
    strands,
    sections,
    filteredUsers,
    currentPage,
    entriesPerPage,
    totalPages,
    setEntriesPerPage,
    setShowAddModal,
    handleEditShow,
    handleShow,
    handlePageChange
  }) => {

    const SEARCH_MAX_LENGTH = 30;
    return (
      <div>
        {/* Filters */}
        <div className="d-flex gap-3 mb-4">
          <Form.Select
            value={selectedStrand}
            onChange={(e) => {
              setSelectedStrand(e.target.value);
              setSelectedSection(""); // Reset section filter
            }}
          >
            <option value="">All Strands</option>
            {strands.map((strand) => (
              <option key={strand._id} value={strand._id}>
                {strand.name}
              </option>
            ))}
          </Form.Select>
  
          <Form.Select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            disabled={!selectedStrand}
          >
            <option value="">All Sections</option>
            {sections
            .filter((section) => section.strand?._id === selectedStrand)
            .map((section) => (
              <option key={section._id} value={section._id}>
                {section.name}
              </option>
          ))}
          </Form.Select>
  
          <InputGroup style={{ width: "800px" }}>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search LRN (e.g., 1234567)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxLength={SEARCH_MAX_LENGTH}
            />
          </InputGroup>
        </div>
  
        {/* Table Controls */}
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
  
          <div>
            <button
              className="btn btn-outline-success mx-2 px-10"
              style={{ width: '150px' }}
              size="sm"
              onClick={() => setShowAddModal(true)}
            >
              Add Users
            </button>
          </div>
        </div>
  
        {/* Table */}
        <Table responsive hover className="custom-table text-center align-middle">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Section</th>
              <th>Strand</th>
              <th>Year Level</th>
              <th>Subjects</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers
              .slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
              .map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex align-items-center justify-content-center">
                      {user.username || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className="text-muted">
                      {user.sections?.[0]?.name || 'Not Assigned'}
                    </span>
                  </td>
                  <td>
                    <span className="text-muted">
                      {user.strand?.name || 'Not Assigned'}
                    </span>
                  </td>
                  <td>
                    <span className="text-muted">
                      {user.yearLevel?.name || 'Not Assigned'}
                    </span>
                  </td>
                  <td>
                    <div className="subjects-list">
                      {user.subjects && user.subjects.length > 0
                        ? user.subjects.map((subject) => (
                          <span key={subject._id || subject} className="subject-pill">
                            {typeof subject === 'object'
                              ? subject.name || 'Unnamed Subject'
                              : 'Unnamed Subject'}
                          </span>
                        ))
                        : 'No Subjects'}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="btn-action"
                        onClick={() => handleEditShow(user)}
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="btn-action"
                        onClick={() => handleShow(user._id)}
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
  
  export default StudTables;
  