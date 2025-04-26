import React, { useEffect, useState } from 'react';
import AdminSidebar from "../AdminComponents/AdminSidebar"; 
import Header from '../components/Header';
import { Container, Row, Col, Table, Button, Form, InputGroup, Card } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useStudentDataContext } from '../hooks/useStudentsDataContext';
import EnrollStudentModal from '../AdminComponents/EnrollStudentModal';
import apiConfig from '../config/apiConfig';

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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingStudents();
        fetchData();
    }, [fetchData]);

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

    const fetchPendingStudents = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            const baseUrl = apiConfig.getBaseUrl();
            const response = await fetch(`${baseUrl}/admin/pending-students`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log('Pending students data:', data);
                setPendingStudents(data);
            } else {
                setError('Failed to fetch pending students');
                console.error('Failed to fetch pending students', data);
            }
        } catch (error) {
            setError('An error occurred while fetching data');
            console.error('Error fetching pending students:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = pendingStudents
        .filter((student) => (selectedStrand ? student.strand?._id === selectedStrand : true))
        .filter((student) => (selectedSection ? student.sections?.some(section => section._id === selectedSection) : true))
        .filter((student) => student.username?.toLowerCase().includes(searchTerm.toLowerCase()));

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
            _id: student._id // <-- Add this
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
                                        <InputGroup style={{ width: "700px" }}>
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
                                    <Table responsive hover className="custom-table text-center align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Name</th>
                                                <th>Grade Level</th>
                                                <th>Strand</th>
                                                <th>Section</th>
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
