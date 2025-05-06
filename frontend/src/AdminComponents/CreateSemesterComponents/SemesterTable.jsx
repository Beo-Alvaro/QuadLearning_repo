import React, { useState } from "react";
import { Table, Button, Form, InputGroup, Modal } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { toast } from 'react-toastify';
const SemesterTable = ({ handleEdit, handleShow, semesters, endSemester }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [endShow, setEndShow] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const SEARCH_MAX_LENGTH = 30;
  // Filtering and Pagination
  const filteredSemesters = semesters
  .filter((semester) => semester.status?.trim().toLowerCase() === "active")
  .filter((semester) => {
    const searchTermLower = searchTerm.toLowerCase();
    const strandName = semester.strand?.name?.toLowerCase() || '';
    const termName = semester.name?.toLowerCase() || '';
    const fullTermName = `${termName} - ${strandName}`;

    return strandName.includes(searchTermLower) || 
           fullTermName.includes(searchTermLower);
  });

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredSemesters.slice(indexOfFirstEntry, indexOfLastEntry);

  const totalPages = Math.ceil(filteredSemesters.length / entriesPerPage);

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
    if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleEndShow = (semesterId) => {
    setSelectedSemesterId(semesterId);
    setEndShow(true);
    toast.warn('Are you sure you want to end the semester? All students will be set to pending, and this action cannot be undone.');
  };

  const handleEndClose = () => {
    setEndShow(false);
    setSelectedSemesterId(null);
  };

  return (
    <div>
      <h2 className="my-4">Semesters List</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Entries Dropdown */}
        <div className="d-flex align-items-center">
          <span>Show</span>
          <Form.Select
            size="sm"
            className="mx-2"
            style={{ width: "auto" }}
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

        {/* Search Bar */}
        <InputGroup style={{ width: "800px" }}>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search for a semester (e.g., 1st - Semester TVL)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxLength={SEARCH_MAX_LENGTH}
          />
        </InputGroup>
      </div>

      {/* Table */}
      <Table responsive hover className="custom-table text-center align-middle">
        <thead className="text-center">
          <tr>
            <th>Strand</th>
            <th>Term</th>
            <th>Year Level</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {currentEntries.map((semester) => (
            <tr key={semester._id}>
              <td>{semester.strand ? semester.strand.name : "N/A"}</td>
              <td>{`${semester.name || "Unnamed Semester"} - ${semester.strand?.name || "No Strand"}`}</td>
              <td>{semester.yearLevel ? semester.yearLevel.name : "N/A"}</td>
              <td>{new Date(semester.startDate).toLocaleDateString()}</td>
              <td>{new Date(semester.endDate).toLocaleDateString()}</td>
              <td>
                <div className="action-buttons">
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="btn-action"
                    onClick={() => handleEdit(semester)}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="btn-action"
                    onClick={() => handleShow(semester._id)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Delete
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="btn-action"
                    onClick={() => handleEndShow(semester._id)}
                  >
                    End
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex justify-content-between mt-3">
        <Button
          variant="outline-primary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handlePageChange("prev")}
        >
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button
          variant="outline-primary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange("next")}
        >
          Next
        </Button>
      </div>

      {/* End Semester Confirmation Modal */}
      <Modal show={endShow} onHide={handleEndClose}>
        <Modal.Header closeButton>
          <Modal.Title className='text-center w-100'>END SEMESTER CONFIRMATION</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center w-100'>
          Are you sure you want to end this semester? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="outline-secondary" className="px-4" onClick={handleEndClose}>
            Cancel
          </Button>
          <Button
          variant="outline-danger"
          className="px-4"
          onClick={() => {
            if (selectedSemesterId) {
              endSemester(selectedSemesterId);
              handleEndClose(); // Close the modal after ending the semester
            }
          }}
        >
          End Semester
        </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SemesterTable;
