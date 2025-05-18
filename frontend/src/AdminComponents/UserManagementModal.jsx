import { Modal, Button, Row, Col } from 'react-bootstrap';
import React from 'react';
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const UserManagementModal = ({ show, handleClose }) => {
    const navigate = useNavigate();

    const handleUserTypeSelect = (type) => {
        handleClose();
        if (type === 'student') {
            navigate('/admin/createstudent');
        } else {
            navigate('/admin/createteacher');
        }
    };

    return (
        <Modal 
            show={show} 
            onHide={handleClose} 
            centered
            size="lg"
            className="user-management-modal"
        >
            <Modal.Header closeButton className="bg-light border-bottom">
                <Modal.Title className="text-dark">
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Create New User Account
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Row className="g-4">
                    <Col md={6}>
                        <div 
                            className="user-type-card cursor-pointer h-100 border rounded p-4 text-center"
                            onClick={() => handleUserTypeSelect('student')}
                        >
                            <FaUserGraduate className="text-primary mb-3" size={48} />
                            <h4>Student Account</h4>
                            <p className="text-muted mb-3">
                                Create a new student account with access to learning resources and progress tracking
                            </p>
                            <Button 
                                variant="outline-primary" 
                                className="w-100"
                            >
                                Create Student Account
                            </Button>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div 
                            className="user-type-card cursor-pointer h-100 border rounded p-4 text-center"
                            onClick={() => handleUserTypeSelect('teacher')}
                        >
                            <FaChalkboardTeacher className="text-success mb-3" size={48} />
                            <h4>Teacher Account</h4>
                            <p className="text-muted mb-3">
                                Create a new teacher account with access to class management and teaching tools
                            </p>
                            <Button 
                                variant="outline-success" 
                                className="w-100"
                            >
                                Create Teacher Account
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default UserManagementModal;