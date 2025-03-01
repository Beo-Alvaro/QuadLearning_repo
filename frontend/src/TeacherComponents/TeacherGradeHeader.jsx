import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
const TeacherGradeHeader = () => {
    return ( 
        <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="mb-1 fw-bold">Encode Grades</h2>
                    <small className="text-muted">
                        Grade Management System
                        <OverlayTrigger
                            placement="right"
                            overlay={
                                <Tooltip>
                                    Accurate grade entry is crucial for student records
                                </Tooltip>
                            }
                        >
                            <i className="bi bi-info-circle text-muted ms-2"></i>
                        </OverlayTrigger>
                    </small>
                </div>
            </div>
    
            <div className="p-3 bg-light rounded-3">
                <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle text-warning me-3"></i>
                <p className="text-secondary mb-0">
                    In this section, you can encode the grades for your students. Please ensure that you enter accurate and complete information. 
                    The grades must be provided in the following format: Midterm, Finals, and Final Rating.
                </p>
                </div>
            </div>
        </Card.Body>
    </Card>
     );
}
 
export default TeacherGradeHeader;