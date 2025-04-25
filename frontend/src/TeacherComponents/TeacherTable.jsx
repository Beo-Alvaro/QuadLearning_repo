import { Table, Button,  Card, } from 'react-bootstrap';
const TeacherTable = ({
    filteredStudents,
    handleSelectStudent,
    modalHandler
  }) => {
    return ( 
      <div>
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className='custom-table text-center align-middle'>
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Year Level</th>
                  <th className="px-4 py-3">Strand</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student._id}>
                    <td className="px-4 py-3 fw-medium">{student.username}</td>
                    <td className="px-4 py-3">{student.sectionName}</td>
                    <td className="px-4 py-3">{student.yearLevel}</td>
                    <td className="px-4 py-3">{student.strand}</td>
                    <td>
                      <Button
                        variant="outline-success" 
                        size="sm"
                        onClick={() => {
                          handleSelectStudent(student._id);
                          modalHandler();
                        }}
                      >
                        Select
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    );
  };
  
  export default TeacherTable;
  