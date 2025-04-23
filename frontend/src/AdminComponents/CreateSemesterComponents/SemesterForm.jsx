import React from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SemesterForm = ({
  strands,
  yearLevels,
  selectedStrand,
  setSelectedStrand,
  selectedYearLevel,
  setSelectedYearLevel,
  name,
  setName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  loading,
  handleSubmit
}) => {
  const navigate = useNavigate();

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Strand</Form.Label>
          <Form.Control
            as="select"
            value={selectedStrand}
            onChange={(e) => setSelectedStrand(e.target.value)}
            required
          >
            <option value="">Select Strand</option>
            {strands.map((strand) => (
              <option key={strand._id} value={strand._id}>
                {strand.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Year Level</Form.Label>
          <Form.Control
            as="select"
            value={selectedYearLevel}
            onChange={(e) => setSelectedYearLevel(e.target.value)}
            required
          >
            <option value="">Select Year Level</option>
            {yearLevels.map((yearLevel) => (
              <option key={yearLevel._id} value={yearLevel._id}>
                {yearLevel.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Semester Period</Form.Label>
          <Form.Control
            as="select"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          >
            <option value="">Select Semester</option>
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
            <option value="Summer Term">Summer Term</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </Form.Group>

        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/admin/ManageSemesters")}
          >
            Cancel
          </Button>
          <Button variant="outline-success" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Semester"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SemesterForm;
