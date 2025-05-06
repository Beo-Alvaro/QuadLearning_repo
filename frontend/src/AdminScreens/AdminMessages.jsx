import { useState, useEffect } from "react"
import { getAdminMessages, markMessageAsRead } from "../services/messageService"
import { Container, Row, Col, ListGroup, Form, InputGroup, Button } from "react-bootstrap"
import Header from "../components/Header"
import AdminSidebar from "../AdminComponents/AdminSidebar"
import ConversationView from "./ConversationView"
import './AdminMessages.css'
import { useAuth } from "../context/authContext"
import { Pagination } from "react-bootstrap"
const AdminMessages = () => {
  const [messages, setMessages] = useState([])
  const { token, adminId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [messagesPerPage] = useState(5)

  let storedToken;

// Update these constants to include console logs for debugging
const filteredMessages = messages.filter((user) => 
  user.username.toLowerCase().includes(searchTerm.toLowerCase())
);

   // Add pagination logic
   const indexOfLastMessage = currentPage * messagesPerPage;
   const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
   const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
   const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
   
 
   // Add pagination handler
   const handlePageChange = (action) => {
    if (action === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      setSelectedUser(null);
    } else if (action === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      setSelectedUser(null);
    }
  };
  
  useEffect(() => {
    const fetchMessages = async () => {
      const storedToken = localStorage.getItem("token")
      if (!storedToken) {
        console.log("No token yet — skipping fetch.")
        return
      }

      setLoading(true)
      try {
        const data = await getAdminMessages(storedToken)
        if (!Array.isArray(data)) {
          console.error("Invalid data format:", data)
          setMessages([])
          return
        }
        const groupedMessages = data.reduce((acc, msg) => {
          const senderId = msg.sender?._id
          if (!senderId) return acc
          if (!acc[senderId]) {
            acc[senderId] = { ...msg.sender, messages: [] }
          }
          acc[senderId].messages.push(msg)
          return acc
        }, {})
        setMessages(Object.values(groupedMessages))
      } catch (error) {
        console.error("Error fetching messages:", error)
        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    if (storedToken || localStorage.getItem("token")) {
      fetchMessages()
    }
  }, [storedToken])

  const handleMarkAsRead = async (messageId) => {
    const storedToken = localStorage.getItem("token")
    try {
      await markMessageAsRead(messageId, storedToken)
      
      // Update messages state to reflect read status
      setMessages((prevMessages) =>
        prevMessages.map((user) => ({
          ...user,
          messages: user.messages.map((msg) => 
            msg._id === messageId ? { ...msg, status: "read" } : msg
          ),
        }))
      );
  
      // Also update selectedUser if this message belongs to them
      if (selectedUser) {
        setSelectedUser(prev => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg._id === messageId ? { ...msg, status: "read" } : msg
          )
        }));
      }
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }


  return (
    <div className="min-vh-100 bg-light d-flex">
      <AdminSidebar style={{ flexShrink: 0, width: "250px", position: "fixed", height: "100%", overflowY: "auto" }} />
      <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
        <Header />
        <Container fluid className="py-4">
          <Row>
            <Col md={4} className="mb-4">
              <div className="bg-white p-3 rounded shadow-sm">
                <h2 className="h4 mb-3 text-success fw-bold">Student Messages</h2>
                <Form className="mb-3">
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-start-0 ps-0 shadow-none"
                    />
                  </InputGroup>
                </Form>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <p className="text-center text-muted">No messages found.</p>
                ) : (
                  <>
                  <ListGroup variant="flush">
                    {currentMessages.map((user) => (
                      <ListGroup.Item
                        key={user._id}
                        action
                        active={selectedUser && selectedUser._id === user._id}
                        onClick={() => setSelectedUser(user)}
                        className="d-flex justify-content-between align-items-center py-3"
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-success d-flex align-items-center justify-content-center me-3"
                            style={{ width: "40px", height: "40px", marginLeft: '20px'}}
                          >
                            <span className="text-white fw-bold">{user.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold">{user.username}</h6>
                            <small className="text-muted">
                              {user.messages[user.messages.length - 1].content.substring(0, 30)}...
                            </small>
                          </div>
                        </div>
                        {user.messages.some((m) => m.status === "unread") && (
                          <span className="badge bg-warning rounded-pill"style={{ marginRight: "20px" }}>
                            {user.messages.filter((m) => m.status === "unread").length}
                          </span>
                        )}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>

                         {/* Add Pagination */}
                         {filteredMessages.length > messagesPerPage && (
  <div className="d-flex justify-content-between mt-3">
    <Button
      variant="outline-primary" 
      size="sm"
      disabled={currentPage === 1}
      onClick={() => handlePageChange('prev')}
    >
      Previous
    </Button>
    <span>Page {currentPage} of {totalPages}</span>
    <Button 
      variant="outline-primary" 
      size="sm"
      disabled={currentPage === totalPages}
      onClick={() => handlePageChange('next')}
    >
      Next
    </Button>
  </div>
)}
                      </>
                )}
              </div>
            </Col>
            <Col md={8}>
              {selectedUser ? (
                <ConversationView user={selectedUser} onMarkAsRead={handleMarkAsRead} />
              ) : (
                <div className="bg-white p-5 rounded shadow-sm text-center">
                  <i className="bi bi-chat-left-text text-muted" style={{ fontSize: "3rem" }}></i>
                  <h3 className="mt-3 text-muted">Select a conversation</h3>
                  <p className="text-muted">Choose a student from the list to view their messages.</p>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default AdminMessages

