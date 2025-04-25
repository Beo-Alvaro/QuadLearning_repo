import { Container, Row, Col, Card, Table, Form, InputGroup } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUsers, FaGraduationCap, FaBook, FaSearch, FaUserClock, FaClipboardList} from 'react-icons/fa';
import './AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminSidebar from './AdminSidebar';
import '../AdminComponents/AdminTableList.css';
import { useState, useEffect } from 'react';
const getRoleBadgeColor = (role) => {
    switch (role.toLowerCase()) {
        case 'admin':
            return 'danger';
        case 'teacher':
            return 'success';
        case 'student':
            return 'info';
        default:
            return 'secondary';
    }
};

const AdminCardsCharts = () => {
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalSections: 0
    });

    const [strandStats, setStrandStats] = useState([]);
    const [sectionDistribution, setSectionDistribution] = useState([]);
    const [users, setUsers] = useState([]);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            try {
                const [usersRes, strandsRes, sectionsRes] = await Promise.all([
                    fetch('/api/admin/getUsers', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch('/api/admin/getStrands', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch('/api/admin/getSections', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                const [users, strands, sections] = await Promise.all([
                    usersRes.json(),
                    strandsRes.json(),
                    sectionsRes.json()
                ]);

                // Calculate dashboard stats
                const students = users.filter(user => user.role === 'student');
                const teachers = users.filter(user => user.role === 'teacher');

                setDashboardData({
                    totalUsers: users.length,
                    totalStudents: students.length,
                    totalTeachers: teachers.length,
                    totalSections: sections.length
                });

                 // Calculate students per strand
                 const strandDistribution = strands.map(strand => ({
                    name: strand.name,
                    Students: students.filter(student => 
                        student.strand && student.strand._id === strand._id
                    ).length
                }));

                setStrandStats(strandDistribution);

                
                // Calculate sections per strand
             const sectionsPerStrand = strands.map(strand => ({
                name: strand.name,
                Sections: sections.filter(section => section.strand && section.strand._id === strand._id).length
            }));

            setSectionDistribution(sectionsPerStrand); // Update the state with sections per strand

                setUsers(users);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    // Filter users for the table
    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    
    return ( 
        <>
         <AdminSidebar />
         <div className='d-flex'>
        <main className="main-content flex-grow-1">
        <Container fluid>
        {/* Stats Cards */}
        <Row className="g-4 mb-4">
        <Col sm={6} lg={3}>
            <Card className="stat-card total-users h-100">
                <Card.Body className="d-flex align-items-center">
                    <FaUsers className="text-primary me-3" size={24} />
                    <div>
                        <Card.Subtitle className="text-muted">Total Users</Card.Subtitle>
                        <Card.Title as="h3">{dashboardData.totalUsers}</Card.Title>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        <Col sm={6} lg={3}>
            <Card className="stat-card total-users h-100">
                <Card.Body className="d-flex align-items-center">
                    <FaGraduationCap className="text-success me-3" size={24} />
                    <div>
                        <Card.Subtitle className="text-muted">Students</Card.Subtitle>
                        <Card.Title as="h3">{dashboardData.totalStudents}</Card.Title>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        <Col sm={6} lg={3}>
            <Card className="stat-card total-users h-100">
                <Card.Body className="d-flex align-items-center">
                    <FaBook className="text-warning me-3" size={24} />
                    <div>
                        <Card.Subtitle className="text-muted">Teachers</Card.Subtitle>
                        <Card.Title as="h3">{dashboardData.totalTeachers}</Card.Title>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        <Col sm={6} lg={3}>
            <Card className="stat-card total-users h-100">
                <Card.Body className="d-flex align-items-center">
                <FaClipboardList className="text-info me-3" size={24} /> 
                    <div>
                        <Card.Subtitle className="text-muted">Total Sections</Card.Subtitle>
                        <Card.Title as="h3">{dashboardData.totalSections}</Card.Title>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        </Row>
        
        {/* Charts */}
        <Row className="g-4 mb-4">
        <Col lg={6}>
            <Card>
                <Card.Body>
                    <Card.Title>Students per Strand</Card.Title>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={strandStats}>  {/* Changed from LineChart to BarChart */}
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />  {/* Changed to use strand name */}
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Students" fill="#8884d8" />  {/* Changed from Line to Bar */}
                        </BarChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>
        </Col>

        <Col lg={6}>
            <Card>
                <Card.Body>
                    <Card.Title>Sections per Strand</Card.Title>
                    <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={sectionDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Sections" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>
        </Col>
        </Row>
        
        {/* User Accounts Table */}
        <Card>
        <Card.Body>
            <Card.Title>User Accounts</Card.Title>
            
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
                
                <InputGroup style={{ width: '200px' }}>
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
        
            <Table responsive hover className='custom-table text-center align-middle'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date Created</th>
                        <th>Role</th>
                    </tr>
                </thead>
             {/* Update the table data */}
             <tbody>
                {filteredUsers
                    .slice(0, entriesPerPage)
                    .map(user => (
                        <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>{user.createdAt}</td>
                            <td className='text-capitalize'><span className={`status-badge bg-${getRoleBadgeColor(user.role)}`}>
                                                        {user.role}
                                                    </span></td>
                        </tr>
                    ))}
            </tbody>
            </Table>
        
            {/* Showing entries info */}
            <div className="text-muted">
                Showing {Math.min(entriesPerPage, filteredUsers.length)} of {filteredUsers.length} entries
            </div>
        </Card.Body>
        </Card>
        </Container>
        </main>
        </div>
        </>
     );
}
 
export default AdminCardsCharts;