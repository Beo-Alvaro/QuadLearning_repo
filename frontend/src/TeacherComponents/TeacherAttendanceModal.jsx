import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form, Alert, Row, Col, Badge, Tabs, Tab } from 'react-bootstrap';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
const TeacherAttendanceModal = ({ isOpen, onClose, sectionId }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [formData, setFormData] = useState({
    schoolName: 'Tropical Village National High School',
    schoolID: 'T school ID',
    district: 'T district',
    division: 'T division',
    region: 'T region',
    schoolYear: '',
    semester: '',
    gradeLevel: '',
    strand: '',
    section: '',
    adviser: '',
    month: ''
  });
  
  // State for tracking which day we're editing
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeDay, setActiveDay] = useState('M');

  // Add this useEffect to fetch semesters
useEffect(() => {
  const fetchSemesters = async () => {
    try {
      const config = getAuthConfig();
      const response = await axios.get('/api/teacher/getSemesters', config);
      if (response.data && response.data.length > 0) {
        setSemesters(response.data);
        setSelectedSemester(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
      setError('Failed to load semesters');
    }
  };

  fetchSemesters();
}, []);

  // Helper function to get auth config
  const getAuthConfig = () => {
    // Try to get token from userInfo first
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    let token = userInfo.token;
    
    // If not found, try direct token
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    if (!token) {
      console.warn('No authentication token found in localStorage');
    }
    
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  };

// Update the fetchAdvisorySection function
useEffect(() => {
  const fetchAdvisorySection = async () => {
    try {
      const config = getAuthConfig();
      const response = await axios.get('/api/teacher/advisorySections', config); // Changed from advisorySection to advisorySections

      if (!response.data?.success || !response.data?.advisorySection) {
        setError('You do not have an advisory section assigned.');
        return;
      }

      const advisorySection = response.data.advisorySection;

      // Check if this modal is being opened for the correct section
      if (advisorySection._id !== sectionId) {
        setError('You can only manage attendance for your advisory section.');
        return;
      }

      // Update form data with advisory section info
      setFormData(prev => ({
        ...prev,
        section: advisorySection.name,
        gradeLevel: advisorySection.yearLevel?.name || '',
        strand: advisorySection.strand?.name || '',
        adviser: response.data.teacherName || ''
      }));

      // After verifying advisory section, fetch students
      await fetchStudents();

    } catch (error) {
      console.error('Error fetching advisory section:', error);
      setError('Failed to verify advisory section.');
    }
  };

  if (sectionId) {
    fetchAdvisorySection();
  }
}, [sectionId]);

    const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const config = getAuthConfig();
      
      // First, get section details
      const { data: sectionData } = await axios.get(
        `/api/teacher/sections/${sectionId}`, 
        config
      );
      
      // Then, get students for this section
      const { data: studentsData } = await axios.get(
        `/api/teacher/students?section=${sectionId}`, 
        config
      );
      
      console.log('Fetched students:', studentsData);
      console.log('Fetched section data:', sectionData);
      
      // Update form data with section info
      if (sectionData) {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const currentSemester = month >= 8 && month <= 12 ? '1st' : '2nd';
        
        setFormData(prev => ({
          ...prev,
          section: sectionData.name,
          gradeLevel: sectionData.yearLevel?.name || '',
          strand: sectionData.strand?.name || '',
          adviser: sectionData.adviser || '',
          semester: currentSemester,
          schoolYear: `${currentDate.getFullYear()}-${currentDate.getFullYear() + 1}`
        }));
      }
      
      // Map student data to attendance format
      const studentAttendanceData = studentsData.map((student, index) => ({
        no: index + 1,
        studentId: student._id,
        name: `${student.lastName}, ${student.firstName} ${student.middleInitial || ''}`.trim(),
        week1: {},
        week2: {},
        week3: {},
        week4: {},
        week5: {},
        absent: 0,
        tardy: 0,
        remarks: ''
      }));
      
      setData(studentAttendanceData);
    } catch (err) {
      console.error('Error fetching students:', err);
      
      if (err.response && err.response.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to load students. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

const fetchAttendanceData = async () => {
  try {
    setLoading(true);
    setError('');
    const config = getAuthConfig();
    
    if (!sectionId || !formData.month || !selectedSemester) {
      return;
    }

    // First get the base student list
    const studentsResponse = await axios.get(
      `/api/teacher/students?section=${sectionId}`,
      config
    );

    // Create base data with empty attendance
    const baseData = studentsResponse.data.map((student, index) => ({
      no: index + 1,
      studentId: student._id,
      name: `${student.lastName}, ${student.firstName} ${student.middleInitial || ''}`.trim(),
      week1: {},
      week2: {},
      week3: {},
      week4: {},
      week5: {},
      absent: 0,
      tardy: 0,
      remarks: ''
    }));

    try {
      // Get existing attendance data for this month
      const attendanceResponse = await axios.get(
        `/api/teacher/attendance?section=${sectionId}&month=${formData.month}&semester=${selectedSemester}`,
        config
      );

      if (attendanceResponse.data?.success && attendanceResponse.data.data?.records) {
        const existingRecords = attendanceResponse.data.data.records;
        
        // Merge existing attendance with base data
        const mergedData = baseData.map(student => {
          const existingRecord = existingRecords.find(
            record => record.student._id === student.studentId
          );
          
          if (existingRecord) {
            return {
              ...student,
              week1: existingRecord.weeks.week1 || {},
              week2: existingRecord.weeks.week2 || {},
              week3: existingRecord.weeks.week3 || {},
              week4: existingRecord.weeks.week4 || {},
              week5: existingRecord.weeks.week5 || {},
              absent: existingRecord.absent || 0,
              tardy: existingRecord.tardy || 0,
              remarks: existingRecord.remarks || ''
            };
          }
          return student;
        });
        
        setData(mergedData);
      } else {
        setData(baseData);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No existing attendance found for this month
        setData(baseData);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error fetching attendance:', error);
    setError('Failed to load attendance data');
  } finally {
    setLoading(false);
  }
};


const handleFormChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  if (name === 'month') {
    // Reset data before fetching new month's attendance
    setData([]);
    fetchAttendanceData();
  }
};

  // Helper function to update attendance for a student
  const updateAttendance = (studentIndex, status) => {
    const updatedData = [...data];
    const weekKey = `week${activeWeek}`;
    
    // Initialize the week object if it doesn't exist
    if (!updatedData[studentIndex][weekKey]) {
      updatedData[studentIndex][weekKey] = {};
    }
    
    // Set the attendance status for the active day
    updatedData[studentIndex][weekKey][activeDay] = status;
    
    // Update absent/tardy counts
    let absentCount = 0;
    let tardyCount = 0;
    
    // Count from all weeks
    ['week1', 'week2', 'week3', 'week4', 'week5'].forEach(week => {
      const weekAttendance = updatedData[studentIndex][week] || {};
      Object.values(weekAttendance).forEach(status => {
        if (status === 'Absent') absentCount++;
        if (status === 'Tardy') tardyCount++;
      });
    });
    
    updatedData[studentIndex].absent = absentCount;
    updatedData[studentIndex].tardy = tardyCount;
    
    setData(updatedData);
  };

  // Get the status for a student on the active day
  const getStatus = (student) => {
    const weekKey = `week${activeWeek}`;
    return student[weekKey]?.[activeDay] || '';
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch the template file with proper error handling
      const templateUrl = '/templates/test.xlsx'; // Make sure this file is in your public/templates folder
      console.log('Fetching template from:', templateUrl);
      
      const templateResponse = await fetch(templateUrl);
      
      if (!templateResponse.ok) {
        throw new Error(`Failed to fetch template: ${templateResponse.status} ${templateResponse.statusText}`);
      }
      
      const templateArrayBuffer = await templateResponse.arrayBuffer();
      console.log('Template loaded, size:', templateArrayBuffer.byteLength, 'bytes');
      
      // 2. Load the template into a workbook
      console.log('Loading template into ExcelJS workbook...');
      const workbook = new ExcelJS.Workbook();
      
      try {
        await workbook.xlsx.load(templateArrayBuffer);
      } catch (xlsxError) {
        console.error('ExcelJS loading error:', xlsxError);
        throw new Error(`Failed to parse Excel template: ${xlsxError.message}`);
      }
      
      // 3. Get the worksheet
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('No worksheet found in the template');
      }
      
      // 4. Map form data to specific cells based on the template structure
      // School information (row 3)
      worksheet.getCell('P3').value = formData.schoolName; // School Name
      worksheet.getCell('V3').value = formData.schoolID;   // School ID
      worksheet.getCell('AF3').value = formData.district;   // District
      worksheet.getCell('AR3').value = formData.division;   // Division
      worksheet.getCell('AX3').value = formData.region;     // Region
      
      // Academic information (row 4)
      worksheet.getCell('P5').value = formData.semester;   // Semester
      console.log('Setting semester to:', formData.semester, 'at cell F5');
      worksheet.getCell('V5').value = formData.schoolYear; // School Year
      worksheet.getCell('AH5').value = formData.gradeLevel; // Grade Level
      worksheet.getCell('AY5').value = formData.strand;        // Track and Strand
      
      // Section information (row 5)
      worksheet.getCell('F7').value = formData.section;    // Section
      worksheet.getCell('AV79').value = formData.adviser;    // Adviser's Name
      worksheet.getCell('AV7').value = formData.month;      // Month of
      
      // 5. Map student data to the attendance table
      // Starting from row 12 (as seen in the image)
      let rowIndex = 12;
      
      // Define column mappings for each day of each week - fixed AMM to AM
      const columnMappings = {
        week1: { M: 'F', T: 'H', W: 'I', TH: 'J', F: 'K', S: 'L' },
        week2: { M: 'M', T: 'O', W: 'P', TH: 'Q', F: 'R', S: 'S' },
        week3: { M: 'T', T: 'V', W: 'W', TH: 'X', F: 'Z', S: 'AB' },
        week4: { M: 'AC', T: 'AE', W: 'AF', TH: 'AG', F: 'AH', S: 'AI' },
        week5: { M: 'AJ', T: 'AK', W: 'AM', TH: 'AN', F: 'AO', S: 'AQ' }
      };
      
      data.forEach((student, index) => {
        // Student number in column A
        worksheet.getCell(`A${rowIndex}`).value = student.no;
        
        // Student name in column C (as shown in your image)
        worksheet.getCell(`C${rowIndex}`).value = student.name;
        
        // Fill in attendance data
        for (let week = 1; week <= 5; week++) {
          const weekKey = `week${week}`;
          const weekData = student[weekKey] || {};
          
          for (let day of ['M', 'T', 'W', 'TH', 'F', 'S']) {
            const status = weekData[day] || '';
            let cellValue = '';
            
            if (status === 'Present') cellValue = '✓';
            else if (status === 'Absent') cellValue = 'A';
            else if (status === 'Tardy') cellValue = 'T';
            
            const column = columnMappings[weekKey][day];
            if (column) { // Add a check to make sure the column exists
              worksheet.getCell(`${column}${rowIndex}`).value = cellValue;
            } else {
              console.warn(`No column mapping found for ${weekKey} ${day}`);
            }
          }
        }
        
        // Add totals in columns AR (Absent) and AT (Tardy)
        worksheet.getCell(`AR${rowIndex}`).value = student.absent; // ABSENT column
        worksheet.getCell(`AT${rowIndex}`).value = student.tardy;  // TARDY column
        worksheet.getCell(`AV${rowIndex}`).value = student.remarks; // REMARKS column
        
        rowIndex++;
      });
      
      console.log('Data mapped to template, generating file...');
      
      // 6. Generate the Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      
      // 7. Save the file using file-saver
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      saveAs(blob, `SF2-SHS_${formData.section}_${formData.month}.xlsx`);
      
      console.log('Excel file generated and downloaded successfully');
      toast.success('Excel file generated and downloaded successfully!')
      setLoading(false);
    } catch (err) {
      console.error('Error exporting Excel file:', err);
      setError('Failed to export the Excel file: ' + err.message);
      setLoading(false);
    }
  };

const handleSaveAttendance = async () => {
    if (!sectionId || !formData.month || !selectedSemester) {
      toast.error('Please select a month and semester');
      return;
    }

    try {
      setLoading(true);
      const config = getAuthConfig();

      const attendanceData = {
        section: sectionId,
        month: formData.month,
        schoolYear: formData.schoolYear,
        semester: selectedSemester,
        records: data.map(student => ({
          student: student.studentId,
          weeks: {
            week1: student.week1 || {},
            week2: student.week2 || {},
            week3: student.week3 || {},
            week4: student.week4 || {},
            week5: student.week5 || {}
          },
          absent: student.absent || 0,
          tardy: student.tardy || 0,
          remarks: student.remarks || ''
        }))
      };

      const response = await axios.post('/api/teacher/attendance', attendanceData, config);

      if (response.data.success) {
        toast.success('Attendance saved successfully!');
        await fetchAttendanceData();
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save attendance';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (sectionId && formData.month && selectedSemester) {
    fetchAttendanceData();
  }
}, [sectionId, formData.month, selectedSemester]);

  return (
    <Modal show={isOpen} onHide={onClose} size="xl" dialogClassName="attendance-modal">
      <Modal.Header closeButton>
        <Modal.Title>Attendance Management</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Row className="mb-4">
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Section</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.section} 
                readOnly
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Grade Level</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.gradeLevel} 
                readOnly
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Strand</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.strand} 
                readOnly
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Month</Form.Label>
              <Form.Control 
                type="month" 
                name="month" 
                value={formData.month} 
                onChange={handleFormChange}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>School Year</Form.Label>
              <Form.Control 
                type="text" 
                name="schoolYear" 
                value={formData.schoolYear} 
                onChange={handleFormChange}
                placeholder="e.g. 2023-2024"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
  <Form.Group className="mb-3">
    <Form.Label>Semester</Form.Label>
    <Form.Select
      value={selectedSemester}
      onChange={(e) => setSelectedSemester(e.target.value)}
      disabled={loading || semesters.length === 0}
    >
      {semesters.length === 0 ? (
        <option>No semesters available</option>
      ) : (
        semesters.map(semester => (
          <option key={semester._id} value={semester._id}>
            {semester.name}
            {semester.status === 'active' ? ' (Active)' : ''}
          </option>
        ))
      )}
    </Form.Select>
  </Form.Group>
</Col>
        </Row>
        
        <Row className="mb-3">
          <Col>
            <h5>Select Week and Day</h5>
            <div className="d-flex mb-3">
              <div className="me-4">
                <Form.Label>Week</Form.Label>
                <Form.Select 
                  value={activeWeek} 
                  onChange={(e) => setActiveWeek(parseInt(e.target.value))}
                >
                  <option value={1}>Week 1</option>
                  <option value={2}>Week 2</option>
                  <option value={3}>Week 3</option>
                  <option value={4}>Week 4</option>
                </Form.Select>
              </div>
              <div>
                <Form.Label>Day</Form.Label>
                <Form.Select 
                  value={activeDay} 
                  onChange={(e) => setActiveDay(e.target.value)}
                >
                  <option value="M">Monday</option>
                  <option value="T">Tuesday</option>
                  <option value="W">Wednesday</option>
                  <option value="TH">Thursday</option>
                  <option value="F">Friday</option>
                  <option value="S">Saturday</option>
                </Form.Select>
              </div>
            </div>
          </Col>
        </Row>
        
        <h5>Attendance for Week {activeWeek}, {activeDay === 'M' ? 'Monday' : 
                                      activeDay === 'T' ? 'Tuesday' : 
                                      activeDay === 'W' ? 'Wednesday' : 
                                      activeDay === 'TH' ? 'Thursday' : 
                                      activeDay === 'F' ? 'Friday' : 'Saturday'}</h5>
        
        <div className="table-responsive">
          <Table bordered hover>
            <thead>
              <tr>
                <th style={{ width: '5%' }}>No.</th>
                <th style={{ width: '40%' }}>Name</th>
                <th style={{ width: '55%' }}>Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((student, index) => (
                <tr key={index}>
                  <td className="text-center">{student.no}</td>
                  <td>{student.name}</td>
                  <td>
                    <div className="d-flex justify-content-between">
                      <Form.Check
                        type="radio"
                        id={`present-${index}`}
                        label="Present"
                        name={`attendance-${index}`}
                        checked={getStatus(student) === 'Present'}
                        onChange={() => updateAttendance(index, 'Present')}
                        className="me-2"
                      />
                      <Form.Check
                        type="radio"
                        id={`absent-${index}`}
                        label="Absent"
                        name={`attendance-${index}`}
                        checked={getStatus(student) === 'Absent'}
                        onChange={() => updateAttendance(index, 'Absent')}
                        className="me-2"
                      />
                      <Form.Check
                        type="radio"
                        id={`tardy-${index}`}
                        label="Tardy"
                        name={`attendance-${index}`}
                        checked={getStatus(student) === 'Tardy'}
                        onChange={() => updateAttendance(index, 'Tardy')}
                        className="me-2"
                      />
                      <Form.Check
                        type="radio"
                        id={`none-${index}`}
                        label="Not Set"
                        name={`attendance-${index}`}
                        checked={getStatus(student) === ''}
                        onChange={() => updateAttendance(index, '')}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        
        <div className="d-flex justify-content-between mt-4">
          <div>
            <h6>Legend:</h6>
            <ul className="list-unstyled">
              <li><Badge bg="success" className="me-1">Present</Badge> - Student attended class</li>
              <li><Badge bg="danger" className="me-1">Absent</Badge> - Student did not attend class</li>
              <li><Badge bg="warning" text="dark" className="me-1">Tardy</Badge> - Student was late</li>
            </ul>
          </div>
          
          <div className="d-flex align-items-end">
            <Button 
              variant="outline-success" 
              onClick={handleSaveAttendance}
              className="me-2"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Attendance'}
            </Button>
            
            <Button 
              variant="outline-primary" 
              onClick={handleExport}
              disabled={loading || data.length === 0}
            >
              Export to Excel
            </Button>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TeacherAttendanceModal;