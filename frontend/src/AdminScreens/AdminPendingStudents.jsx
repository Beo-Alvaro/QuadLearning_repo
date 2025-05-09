import React, { useEffect, useState } from 'react';
import AdminSidebar from "../AdminComponents/AdminSidebar"; 
import Header from '../components/Header';
import { Container, Row, Col, Table, Button, Form, InputGroup, Card } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useStudentDataContext } from '../hooks/useStudentsDataContext';
import EnrollStudentModal from '../AdminComponents/EnrollStudentModal';
import { ToastContainer } from 'react-toastify';

const AdminPendingStudents = () => {
    const [pendingStudents, setPendingStudents] = useState([]);
    const [selectedStrand, setSelectedStrand] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [filteredSections, setFilteredSections] = useState([]);
    const [sortField, setSortField] = useState('username');
    const [sortDirection, setSortDirection] = useState('asc');

    const getSortedStudents = (students) => {
        return [...students].sort((a, b) => {
            let aValue = '';
            let bValue = '';
    
            switch(sortField) {
                case 'username':
                    aValue = a.username?.toLowerCase() || '';
                    bValue = b.username?.toLowerCase() || '';
                    break;
                case 'yearLevel':
                    aValue = a.yearLevel?.name?.toLowerCase() || '';
                    bValue = b.yearLevel?.name?.toLowerCase() || '';
                    break;
                case 'strand':
                    aValue = a.strand?.name?.toLowerCase() || '';
                    bValue = b.strand?.name?.toLowerCase() || '';
                    break;
                case 'section':
                    aValue = a.sections?.[0]?.name?.toLowerCase() || '';
                    bValue = b.sections?.[0]?.name?.toLowerCase() || '';
                    break;
                default:
                    aValue = a[sortField]?.toLowerCase() || '';
                    bValue = b[sortField]?.toLowerCase() || '';
            }
            
            return sortDirection === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });
    };

    const [newUser, setNewUser] = useState({ 
      strand: '',
      section: '',
      subjects: [],
      semester: '',
      yearLevel: '', 
      status: 'active'
    });
    const [error, setError] = useState('');
    const { strands, sections, yearLevels, semesters, fetchData, subjects } = useStudentDataContext();

    const SEARCH_MAX_LENGTH = 30;

    useEffect(() => {
      fetchData();
    }, [])

    useEffect(() => {
      const safeFilterSections = (strandId) => {
          if (!strandId || !sections || sections.length === 0) {
              return [];
          }
  
          return sections.filter(section => {
              // Ensure section and its properties are valid
              if (!section || !section.strand) {
                  console.warn('Invalid section or missing strand:', section);
                  return false;
              }
  
              const sectionStrandId = typeof section.strand === 'object' 
                  ? section.strand._id 
                  : section.strand;
  
              return sectionStrandId && sectionStrandId === strandId;
          });
      };
  
      let filteredSectionsResult = [];
  
      // Use optional chaining and provide a fallback
      const activeStrand = (showModal ? newUser.strand : null) || '';
  
      if (activeStrand) {
          filteredSectionsResult = safeFilterSections(activeStrand);
      }
  
      setFilteredSections(filteredSectionsResult);
  }, [newUser.strand, sections, showModal]);

    useEffect(() => {
        const fetchPendingStudents = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('/api/admin/pending-students', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setPendingStudents(data);
                } else {
                    console.error('Failed to fetch pending students:', data.message, data.error);
                }
            } catch (error) {
                console.error('Error fetching pending students:', error);
            }
        };    
        fetchPendingStudents();
    }, []);

const filteredStudents = getSortedStudents(
    pendingStudents
        .filter((student) => (selectedStrand ? student.strand?._id === selectedStrand : true))
        .filter((student) => (selectedSection ? student.sections?.some(section => section._id === selectedSection) : true))
        .filter((student) => student.username?.toLowerCase().includes(searchTerm.toLowerCase()))
);

    const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleOpenModal = (student) => {
        setSelectedStudent(student);
        setNewUser({ 
            yearLevel: '', 
            strand: '', 
            section: '',
            semester: '',
            subjects: [], // Add this to initialize empty subjects array
            _id: student._id,
            status: 'active'
        });
        setError('');
        setShowModal(true);
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedStudent(null);
    };

    return (
        <>
            <Header />
            <ToastContainer />
            <div className="d-flex">
                <AdminSidebar />
                <Container fluid className="ms-auto me-auto py-4">
                    <Row className="justify-content-center">
                        <Col xs={12} md={10} lg={8}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Pending Student Accounts</Card.Title>
                                    <div className="d-flex gap-3 mb-4">
                                        <Form.Select
                                            value={selectedStrand}
                                            onChange={(e) => {
                                                setSelectedStrand(e.target.value);
                                                setSelectedSection("");
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
                                        <InputGroup style={{ width: "1000px" }}>
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
                                    <Table responsive hover className="custom-table text-center align-middle">
                                    <thead className="bg-light">
    <tr>
        <th onClick={() => {
            setSortDirection(sortField === 'username' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
            setSortField('username');
        }} style={{ cursor: 'pointer' }}>
            Name <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ${sortField === 'username' ? '' : 'invisible'}`}></i>
        </th>
        <th onClick={() => {
            setSortDirection(sortField === 'yearLevel' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
            setSortField('yearLevel');
        }} style={{ cursor: 'pointer' }}>
            Grade Level <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ${sortField === 'yearLevel' ? '' : 'invisible'}`}></i>
        </th>
        <th onClick={() => {
            setSortDirection(sortField === 'strand' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
            setSortField('strand');
        }} style={{ cursor: 'pointer' }}>
            Strand <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ${sortField === 'strand' ? '' : 'invisible'}`}></i>
        </th>
        <th onClick={() => {
            setSortDirection(sortField === 'section' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
            setSortField('section');
        }} style={{ cursor: 'pointer' }}>
            Section <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ${sortField === 'section' ? '' : 'invisible'}`}></i>
        </th>
        <th>Action</th>
    </tr>
</thead>
                                        <tbody>
                                            {filteredStudents.map(student => (
                                                <tr key={student._id}>
                                                    <td>{student.username}</td>
                                                    <td>{student.yearLevel.name}</td>
                                                    <td>{student.strand.name}</td>
                                                    <td>{student.sections?.[0]?.name}</td>
                                                    <td>
                                                        <Button 
                                                            variant="outline-success" 
                                                            size="sm" 
                                                            onClick={() => handleOpenModal(student)}
                                                        >
                                                            Enroll Student
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    <div className="d-flex justify-content-between mt-3">
                                        <Button variant="outline-primary" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange('prev')}>
                                            Previous
                                        </Button>
                                        <span>Page {currentPage} of {totalPages}</span>
                                        <Button variant="outline-primary" size="sm" disabled={currentPage === totalPages} onClick={() => handlePageChange('next')}>
                                            Next
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            <EnrollStudentModal 
    show={showModal}
    onClose={handleCloseModal}
    student={selectedStudent}
    newUser={newUser}
    setNewUser={setNewUser}
    yearLevels={yearLevels}
    strands={strands}
    filteredSections={filteredSections} 
    semesters={semesters}
    error={error}
    subjects={subjects}
    setPendingStudents={setPendingStudents}
    setError={setError}
    pendingStudents={pendingStudents}
/>
        </>
    );
};

export default AdminPendingStudents;
