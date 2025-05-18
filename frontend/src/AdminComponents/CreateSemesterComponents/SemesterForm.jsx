import React from "react";
import { Form, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
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

  const handleClear = () => {
    setSelectedStrand("");
    setSelectedYearLevel("");
    setName("");
    setStartDate("");
    setEndDate("");
  }

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Strand
                        <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip className='custom-tooltip'>Select a Strand to proceed.</Tooltip>}
                        >
                        <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                        </OverlayTrigger>
          </Form.Label>
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
          <Form.Label>Year Level
                        <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip className='custom-tooltip'>Select a Year Level to proceed.</Tooltip>}
                        >
                        <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                        </OverlayTrigger>
          </Form.Label>
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
          <Form.Label>Semester Period
          <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip className='custom-tooltip'>Select a Semester Period to proceed.</Tooltip>}
                        >
                        <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                        </OverlayTrigger>
          </Form.Label>
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
          <Form.Label>Start Date
                        <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip className='custom-tooltip'>Start Date is required to proceed.</Tooltip>}
                        >
                        <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                        </OverlayTrigger>
          </Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>End Date
                        <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip className='custom-tooltip'>The End Date is required to proceed and must not be earlier than the Start Date.</Tooltip>}
                        >
                        <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                        </OverlayTrigger>
          </Form.Label>
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
            onClick={() => handleClear()}
          >
            Clear
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
