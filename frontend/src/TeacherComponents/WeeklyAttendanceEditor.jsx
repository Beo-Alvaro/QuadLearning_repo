import React, { useState } from 'react';
import { Modal, Table, Form, Button } from 'react-bootstrap';

const WeeklyAttendanceEditor = ({ show, onHide, studentName, weekNumber, attendance, onSave }) => {
  const [weekData, setWeekData] = useState(attendance || {});
  
  const days = ['M', 'T', 'W', 'TH', 'F'];
  
  const handleAttendanceChange = (day, value) => {
    setWeekData(prev => ({
      ...prev,
      [day]: value
    }));
  };
  
  const handleSave = () => {
    onSave(weekData);
    onHide();
  };
  
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Week {weekNumber} Attendance for {studentName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table bordered className="text-center">
          <thead>
            <tr>
              {days.map(day => (
                <th key={day} className="text-center">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {days.map(day => (
                <td key={day}>
                  <Form.Select
                    value={weekData[day] || ''}
                    onChange={(e) => handleAttendanceChange(day, e.target.value)}
                  >
                    <option value="">-</option>
                    <option value="Present">✓</option>
                    <option value="Absent">A</option>
                    <option value="Tardy">T</option>
                  </Form.Select>
                </td>
              ))}
            </tr>
          </tbody>
        </Table>
        <div className="mt-3">
          <p className="mb-1"><strong>Legend:</strong></p>
          <ul className="list-unstyled">
            <li>✓ - Present</li>
            <li>A - Absent</li>
            <li>T - Tardy/Late</li>
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WeeklyAttendanceEditor; 