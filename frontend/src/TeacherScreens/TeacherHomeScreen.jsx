import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Calendar, Users, BookOpen, Award, BarChart2 } from 'lucide-react';
import TeacherDashboardNavbar from '../TeacherComponents/TeacherDashboardNavbar';
import './Teacher.css';
import { apiRequest } from '../utils/api';

const TeacherHomeScreen = () => {
  const [dashboardData, setDashboardData] = useState({
    username: '',
    totalStudents: 0,
    totalSubjects: 0,
    totalSections: 0,
    advisorySection: '',
    sections: [],
    subjects: [],
    currentSemester: ''
  });
  // Add new state for section averages
const [sectionAverages, setSectionAverages] = useState([]);
// Add new state for subject performance
const [subjectPerformance, setSubjectPerformance] = useState([]);


  // State for real attendance data
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
// Add new state variables
const [semesters, setSemesters] = useState([]);
const [selectedSemester, setSelectedSemester] = useState('');


// Update the subject performance chart section with loading state
const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

const fetchSemesters = useCallback(async () => {
  try {
    setIsLoadingAttendance(true); // Add loading state
    const config = getAuthConfig();
    const data = await apiRequest('/api/teacher/getSemesters', config);
    console.log('Fetched semesters:', data);
    
    if (data && data.length > 0) {
      setSemesters(data);
      setSelectedSemester(data[0]._id);
    } else {
      console.log('No semesters found');
      setSemesters([]);
    }
  } catch (error) {
    console.error('Error fetching semesters:', error);
    setSemesters([]);
  } finally {
    setIsLoadingAttendance(false);
  }
}, []);
  
  // Add a new state variable for the date range
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Helper function to get auth config
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

// Add function to fetch section averages
const fetchSectionAverages = useCallback(async () => {
  try {
    const config = getAuthConfig();
    const data = await apiRequest(
      `/api/teacher/section-averages?semester=${selectedSemester}`,
      config
    );

    if (data.success) {
      setSectionAverages(data.data);
    }
  } catch (error) {
    console.error('Error fetching section averages:', error);
  }
}, [selectedSemester]);

// Update useEffect to fetch section averages
useEffect(() => {
  if (selectedSemester) {
    fetchSectionAverages();
  }
}, [selectedSemester, fetchSectionAverages]);

// Add function to fetch subject performance
const fetchSubjectPerformance = useCallback(async () => {
  try {
    if (!selectedSemester) {
      console.log('No semester selected, skipping fetch');
      return;
    }

    setIsLoadingSubjects(true); // Start loading
    console.log('Fetching subject performance for semester:', selectedSemester);
    const config = getAuthConfig();
    
    const data = await apiRequest(
      `/api/teacher/subject-performance`,
      {
        ...config,
        params: {
          semesterId: selectedSemester
        }
      }
    );

    console.log('Subject performance API response:', data);

    if (data.success && Array.isArray(data.data)) {
      setSubjectPerformance(data.data);
    }
  } catch (error) {
    console.error('Error fetching subject performance:', error);
  } finally {
    setIsLoadingSubjects(false); // End loading regardless of outcome
  }
}, [selectedSemester]);

useEffect(() => {
  if (selectedSemester) {
    fetchSubjectPerformance();
  }
}, [selectedSemester, fetchSubjectPerformance]);

// Update the grade distribution chart
const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0'];

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const config = getAuthConfig();
      const data = await apiRequest('/api/teacher/dashboard', config);
      setDashboardData(data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, []);

  // Update the transformAttendanceData function to not use mock data
  const transformAttendanceData = (apiData) => {
    console.log('Raw API data:', apiData); // Add this log
    
    if (!apiData || !apiData.days) {
      console.warn('Unexpected API data format:', apiData);
      return [];
    }
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    
    const transformed = days.map((day, index) => {
      const dayKey = dayKeys[index];
      const dayData = apiData.days[dayKey] || { present: 0, absent: 0 };
      
      return {
        name: day,
        present: dayData.present || 0,
        absent: dayData.absent || 0
      };
    });
    
    console.log('Transformed data:', transformed); // Add this log
    return transformed;
  };

  const fetchAttendanceData = useCallback(async (weekType = 'current') => {
    try {
      if (!selectedSemester) {
        console.log('No semester selected');
        return;
      }
  
      setIsLoadingAttendance(true);
      const config = getAuthConfig();
      
      console.log(`Fetching attendance data for ${weekType} week...`);
      const data = await apiRequest(
        `/api/teacher/attendance/summary?week=${weekType}&semester=${selectedSemester}`,
        config
      );
      
      if (data && data.success) {
        const formattedData = transformAttendanceData(data.data);
        setAttendanceData(formattedData);
        
        if (data.data.dateRange) {
          setDateRange(data.data.dateRange);
        }
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData([]);
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [selectedSemester]);
  

  // Handle week selection change
  const handleWeekChange = (e) => {
    const weekType = e.target.value;
    setSelectedWeek(weekType);
    fetchAttendanceData(weekType);
  };

  // Add semester change handler
  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
    fetchAttendanceData(selectedWeek);
  };

  // Update useEffect to fetch semesters
  useEffect(() => {
    fetchDashboardData();
    fetchSemesters();
  }, [fetchDashboardData, fetchSemesters]);

  // Update useEffect for attendance data
  useEffect(() => {
    if (selectedSemester) {
      fetchAttendanceData('current');
    }
  }, [fetchAttendanceData, selectedSemester]);


  useEffect(() => {
    fetchDashboardData();
    fetchAttendanceData('current'); // Fetch current week by default
  }, [fetchDashboardData, fetchAttendanceData]);

  return (
    <>
      <TeacherDashboardNavbar />
      <Container fluid className="dashboard-content py-4">
                    {/* Welcome Section */}
                    <Row className="mb-4 align-items-center">
                        <Col>
                            <h2 className="welcome-heading">
                                {(() => {
                                    const hour = new Date().getHours();
                if (hour < 12) return `Good Morning, ${dashboardData.username || 'Teacher'}`;
                if (hour < 17) return `Good Afternoon, ${dashboardData.username || 'Teacher'}`;
                return `Good Evening, ${dashboardData.username || 'Teacher'}`;
              })()}
                            </h2>
                            <p className="welcome-subtext">
                                Ready to inspire and educate today's learners?
                            </p>
                        </Col>
                        <Col md={4} className="text-end">
                            <div className="calendar-badge">
                                <Calendar size={18} className="me-2" />
                                {new Date().toLocaleDateString('en-PH', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    timeZone: 'Asia/Manila'
                                })}
                            </div>
                        </Col>
                    </Row>

                    {/* Quick Stats */}
                    <Row className="mb-4">
                        <Col md={3}>
                            <Card className="stat-card">
                                <Card.Body>
                                    <div className="stat-icon students">
                                        <Users size={24} />
                                    </div>
                                    <div className="stat-content">
                                        <h3>{dashboardData.totalStudents || 0}</h3>
                                        <p>Total Students</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="stat-card">
                                <Card.Body>
                                    <div className="stat-icon subjects">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="stat-content">
                                        <h3>{dashboardData.subjects?.length || 0}</h3>
                                        <p>Subjects Handled</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="stat-card">
                                <Card.Body>
                                    <div className="stat-icon sections">
                                        <Users size={24} />
                                    </div>
                                    <div className="stat-content">
                                        <h3>{dashboardData.sections?.length || 0}</h3>
                                        <p>Sections</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                        <Card className="stat-card">
    <Card.Body>
        <div className="stat-icon advisory">
            <Award size={24} />
        </div>
        <div className="stat-content">
            <h3>
                {dashboardData.advisorySection ? (
                    <>
                        {dashboardData.advisorySection.name}
                        <small className="d-block text-muted">
                            {dashboardData.advisorySection.yearLevel} - {dashboardData.advisorySection.strand}
                        </small>
                    </>
                ) : (
                    'No Advisory'
                )}
            </h3>
            <p>Advisory Section</p>
        </div>
    </Card.Body>
</Card>
                        </Col>
                    </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col>
            <h4 className="section-title">Quick Actions</h4>
            <Row>
              <Col md={3}>
                <Link to="/teacher/encodegrades" className="text-decoration-none">
                  <Card className="action-card">
                    <Card.Body>
                      <div className="action-icon">
                        <Award size={24} />
                      </div>
                      <h5>Manage Grades</h5>
                      <p className="action-description">Enter and update student grades</p>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
              <Col md={3}>
                <Link to="/teacher/generateform" className="text-decoration-none">
                  <Card className="action-card">
                    <Card.Body>
                      <div className="action-icon">
                        <Calendar size={24} />
                      </div>
                      <h5>Generate Form</h5>
                      <p className="action-description">Create and print official forms</p>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
              <Col md={3}>
                <Link to="/teacher/viewstudents" className="text-decoration-none">
                  <Card className="action-card">
                    <Card.Body>
                      <div className="action-icon">
                        <Users size={24} />
                      </div>
                      <h5>View Students</h5>
                      <p className="action-description">Browse student sections and details</p>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
              <Col md={3}>
                <Link to="/teacher/attendance" className="text-decoration-none">
                  <Card className="action-card">
                    <Card.Body>
                      <div className="action-icon">
                        <BarChart2 size={24} />
                      </div>
                      <h5>Attendance</h5>
                      <p className="action-description">View and update daily attendance records</p>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            </Row>
                        </Col>
                    </Row>

                    {/* Charts Section */}
                    <Row className="mb-4">
                        <Col md={8}>
                            <Card className="chart-card">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-0">Weekly Attendance for Handled Sections</h5>
                                        {attendanceData.length > 0 && dateRange.start && dateRange.end && (
                                            <small className="text-muted">
                                                {new Date(dateRange.start).toLocaleDateString('en-PH', { 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })} - {new Date(dateRange.end).toLocaleDateString('en-PH', { 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </small>
                                        )}
                                    </div>
                                    <div className="chart-actions">

                                    <Form.Select 
  value={selectedSemester} 
  onChange={handleSemesterChange}
  size="sm"
  style={{ width: 'auto', display: 'inline-block', marginRight: '10px' }}
  disabled={semesters.length === 0 || isLoadingAttendance}
>
  {isLoadingAttendance ? (
    <option>Loading semesters...</option>
  ) : semesters.length === 0 ? (
    <option>No semesters available</option>
  ) : (
    semesters.map(semester => (
      <option key={semester._id} value={semester._id}>
        {semester.name} {semester.isActive ? '(Active)' : ''}
      </option>
    ))
  )}
</Form.Select>
                                        <Form.Select 
                                            value={selectedWeek} 
                                            onChange={handleWeekChange}
                                            size="sm"
                                            style={{ width: 'auto', display: 'inline-block' }}
                                        >
                                            <option value="current">Current Week</option>
                                            <option value="previous">Previous Week</option>
                                            <option value="twoWeeksAgo">Two Weeks Ago</option>
                                        </Form.Select>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    {isLoadingAttendance ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-dark" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2">Loading attendance data...</p>
                                        </div>
                                    ) : attendanceData.length > 0 ? (
                                      <ResponsiveContainer width="100%" height={300}>
                                      <BarChart data={attendanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 'auto']} 
                                        allowDecimals={false} // This prevents decimal values
                                        tickFormatter={(value) => Math.round(value)} // Rounds the tick values
                                        /> {/* Add domain to better handle zero values */}
                                        
                                        <Tooltip 
                                        formatter={(value, name) => [
                                          `${Math.round(value)} students`, // Rounds the tooltip values
                                          name
                                        ]} 
                                      />
                                        <Legend />
                                        <Bar dataKey="present" fill="#4CAF50" name="Present" minPointSize={3} /> {/* Add minPointSize */}
                                        <Bar dataKey="absent" fill="#FF5252" name="Absent" minPointSize={3} />
                                      </BarChart>
                                    </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center py-5">
                                            <p>No attendance data available for this week.</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                        <Card className="chart-card">
  <Card.Header className="d-flex justify-content-between align-items-center">
    <h5 className="mb-0">Section Grade Averages</h5>
    <Form.Select 
      value={selectedSemester} 
      onChange={handleSemesterChange}
      size="sm"
      style={{ width: 'auto' }}
    >
      {semesters.map(semester => (
        <option key={semester._id} value={semester._id}>
          {semester.name}
        </option>
      ))}
    </Form.Select>
  </Card.Header>
  <Card.Body>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={sectionAverages}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, average }) => `${name}: ${average}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="average"
        >
          {sectionAverages.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name) => [`Average: ${value}%`, `Section: ${name}`]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </Card.Body>
</Card>

                        </Col>
                    </Row>
                    

                    {/* Subject Performance Chart */}
                    <Row className="mb-4">
                        <Col>
                        <Card className="chart-card">
  <Card.Header className="d-flex justify-content-between align-items-center">
    <h5 className="mb-0">Subject Performance</h5>
    <Form.Select 
      value={selectedSemester} 
      onChange={handleSemesterChange}
      size="sm"
      style={{ width: 'auto' }}
      disabled={isLoadingSubjects}
    >
      {semesters.map(semester => (
        <option key={semester._id} value={semester._id}>
          {semester.name}
        </option>
      ))}
    </Form.Select>
  </Card.Header>
  <Card.Body>
    {isLoadingSubjects ? (
      <div className="text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading subject performance data...</p>
      </div>
    ) : subjectPerformance.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={subjectPerformance}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
  dataKey="name" 
  angle={-25} // Slight tilt for better readability
  textAnchor="end" 
  height={100} // Increased height for better spacing
  interval={0} // Ensures all labels are displayed
  tick={{ 
    fontSize: 12, // Adjust font size for readability
    fill: "#555", // Dark gray for better contrast
    fontWeight: "bold", // Make labels stand out
  }}
  tickLine={{ stroke: "#ccc" }} // Subtle tick lines
/>
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Average']}
            labelFormatter={(label) => `Subject: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="average" 
            stroke="#1b8231" 
            activeDot={{ r: 8 }} 
            name="Class Average" 
          />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className="text-center py-5">
        <p>No subject performance data available for this semester.</p>
        <small className="text-muted">Selected Semester ID: {selectedSemester}</small>
      </div>
    )}
  </Card.Body>
</Card>
                        </Col>
                    </Row>
                </Container>
    </>
    );
};

export default TeacherHomeScreen;
