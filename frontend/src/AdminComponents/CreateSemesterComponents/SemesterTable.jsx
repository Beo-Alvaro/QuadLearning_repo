import React from "react";
import { Table, Button, Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
const SemesterTable = ({
  handleEdit,
  handleShow,
  semesters,
  endSemester
}) => {

        const [searchTerm, setSearchTerm] = useState('');
        const [entriesPerPage, setEntriesPerPage] = useState(10);
        const [currentPage, setCurrentPage] = useState(1);
    // Filtering and Pagination
    const filteredSemesters = semesters
    .filter((semester) => semester.status?.trim().toLowerCase() === "active")
    .filter((semester) => semester?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredSemesters.slice(indexOfFirstEntry, indexOfLastEntry);
    console.log(currentEntries)
    const totalPages = Math.ceil(filteredSemesters.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
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
        <InputGroup style={{ width: "300px" }}>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                  <Button variant="outline-danger"
                    size="sm"
                    className="btn-action" onClick={() => endSemester(semester._id)}>End</Button>
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
    </div>
  );
};

export default SemesterTable;
