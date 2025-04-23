import { useState, useEffect } from "react"
import { sendMessage, fetchAdminId } from "../services/messageService"
import StudentDashboardNavbar from "../StudentComponents/StudentDashboardNavbar"
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap"
import { ToastContainer, toast } from 'react-toastify';
const StudentMessages = () => {
  const [adminId, setAdminId] = useState(null)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    setToken(storedToken)

    const getAdminId = async () => {
      try {
        const id = await fetchAdminId()
        if (id) setAdminId(id)
      } catch (error) {
        console.error("Failed to fetch admin ID:", error)
      }
    }

    if (!adminId && storedToken) {
      getAdminId()
    }
  }, [adminId])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!adminId) {
      console.error("Admin ID is not available")
      return
    }

    if (!token) {
      console.error("Token is not available")
      return
    }

    try {
      await sendMessage(message, adminId, token)
      setSuccess(true)
      setMessage("")
      toast.success('Message sent successfully!')
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return (
    <>
      <StudentDashboardNavbar />
      <ToastContainer />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
              <h2 className="text-center mb-4 text-success">Contact Admin</h2>
<p className="text-center text-muted">
  Remember to be respectful and do not use this for unnecessary purposes.
</p>
<Alert variant="danger" className="text-center fw-bold mb-2">
  🚨 Warning: Misuse of this feature, including sending inappropriate or joke messages, 
  may result in disciplinary action.
</Alert>
                <Form onSubmit={handleSendMessage}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Your Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="border-success"
                    />
                  </Form.Group>
                  <Button variant="success" type="submit" className="w-100 py-2 mt-3 fw-bold">
                    <i className="bi bi-send me-2"></i>
                    Send Message
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default StudentMessages
