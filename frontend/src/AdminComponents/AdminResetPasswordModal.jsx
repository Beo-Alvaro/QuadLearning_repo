import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useContext } from 'react';
import { useUsersDataContext } from '../hooks/useUsersDataContext';

const AdminResetPasswordModal = ({ show, handleClose, selectedUserId }) => {
    const { handleResetPassword } = useUsersDataContext();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword === confirmPassword) {
            handleResetPassword(selectedUserId, newPassword);
            handleClose();
            setNewPassword('');
            setConfirmPassword('');
        } else {
            alert('Passwords do not match!');
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Reset Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formNewPassword">
                        <Form.Label className="mb-2">New Password</Form.Label>
                        <Form.Control
                            className="mb-2"
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formConfirmPassword">
                        <Form.Label className="mb-2">Confirm Password</Form.Label>
                        <Form.Control
                            className="mb-2"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Reset Password
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AdminResetPasswordModal;
