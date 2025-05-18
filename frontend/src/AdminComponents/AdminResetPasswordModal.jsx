import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {toast, ToastContainer} from 'react-toastify';
import { useUsersDataContext } from '../hooks/useUsersDataContext';
const AdminResetPasswordModal = ({ show, setShow, selectedUserId, setSelectedUserId }) => {
    const { handleResetPassword } = useUsersDataContext();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);

    const passwordValidation = {
        minLength: (password) => password.length >= 8,
        hasUppercase: (password) => /[A-Z]/.test(password),
        hasNumber: (password) => /[0-9]/.test(password),
        hasSymbol: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
      };

      const [validations, setValidations] = useState({
        minLength: false,
        hasUppercase: false,
        hasNumber: false,
        hasSymbol: false
    });

    useEffect(() => {
        setValidations({
            minLength: passwordValidation.minLength(newPassword),
            hasUppercase: passwordValidation.hasUppercase(newPassword),
            hasNumber: passwordValidation.hasNumber(newPassword),
            hasSymbol: passwordValidation.hasSymbol(newPassword)
        });
    }, [newPassword]);

    const handleSubmit = (e) => {
        e.preventDefault();

            // Check if all password requirements are met
    const isPasswordValid = Object.values(validations).every(v => v);
    
    if (!isPasswordValid) {
        toast.error('Password is not strong enough. Please meet all requirements.');
        return;
    }

        if (newPassword === confirmPassword) {
            handleResetPassword(selectedUserId, newPassword);
            handleClose();
            setNewPassword('');
            setConfirmPassword('');
            toast.success('Password reset successfully!');
        } else {
            toast.warning('Passwords do not match!');
        }
    };

    const handleClose = () => {
        setShow(false);
        setSelectedUserId(null);
        setNewPassword('');
        setConfirmPassword('');
        setShowRequirements(false); // Hide requirements when modal closes
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
                        <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip className='custom-tooltip'>A password is required to continue.</Tooltip>}
                    >
                        <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                        </OverlayTrigger>
                        <div className="position-relative">
                           <Form.Control
                                className="mb-2"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    if (!showRequirements) setShowRequirements(true);
                                }}
                                onFocus={() => setShowRequirements(true)}
                                required
                            />
                            <Button
                                className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-success`}></i>
                            </Button>
                        </div>
                        {showRequirements && (
                            <div className="password-requirements mb-3">
                                <small className={`d-block ${validations.minLength ? 'text-success' : 'text-danger'}`}>
                                    <i className={`bi ${validations.minLength ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                                    {' '}Minimum 8 characters
                                </small>
                                <small className={`d-block ${validations.hasUppercase ? 'text-success' : 'text-danger'}`}>
                                    <i className={`bi ${validations.hasUppercase ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                                    {' '}One uppercase letter
                                </small>
                                <small className={`d-block ${validations.hasNumber ? 'text-success' : 'text-danger'}`}>
                                    <i className={`bi ${validations.hasNumber ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                                    {' '}One number
                                </small>
                                <small className={`d-block ${validations.hasSymbol ? 'text-success' : 'text-danger'}`}>
                                    <i className={`bi ${validations.hasSymbol ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                                    {' '}One special character
                                </small>
                            </div>
                        )}
                    </Form.Group>
                    <Form.Group controlId="formConfirmPassword">
                        <Form.Label className="mb-2">Confirm Password</Form.Label>
                        <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip className='custom-tooltip'>Please confirm your password to proceed. It must match the new password.</Tooltip>}
                    >
                        <i class="bi bi-exclamation-circle text-danger ms-2"></i>
                        </OverlayTrigger>
                        <div className="position-relative">
                            <Form.Control
                                className="mb-2"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <Button
                                className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                type="button"
                            >
                                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} text-success`}></i>
                            </Button>
                        </div>
                    </Form.Group>
                    <Button variant="outline-success" type="submit">
                        Reset Password
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AdminResetPasswordModal;
