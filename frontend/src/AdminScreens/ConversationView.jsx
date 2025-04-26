import { useState, useEffect } from "react"
import { Card, Button } from "react-bootstrap"

const ConversationView = ({ user, onMarkAsRead }) => {
  const [messages, setMessages] = useState(user.messages)

  useEffect(() => {
    // Mark unread messages as read when conversation is opened
    const markMessagesAsRead = async () => {
      try {
        const unreadMessages = user.messages.filter(msg => msg.status === 'unread');
        
        // Mark each unread message as read
        for (const message of unreadMessages) {
          await onMarkAsRead(message._id);
        }

        // Update local state
        setMessages(prevMessages => 
          prevMessages.map(msg => ({
            ...msg,
            status: 'read'
          }))
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    if (user && user.messages.some(msg => msg.status === 'unread')) {
      markMessagesAsRead();
    }
  }, [user, onMarkAsRead]);

  // Update messages when user prop changes
  useEffect(() => {
    setMessages(user.messages);
  }, [user.messages]);

  const handleMarkAsRead = async (messageId) => {
    try {
      await onMarkAsRead(messageId)
      setMessages(messages.map(msg => 
        msg._id === messageId ? { ...msg, status: "read" } : msg
      ))
    } catch (error) {
      console.error("Failed to mark message as read:", error)
    }
  }

  const messageContainerStyle = {
    transition: "all 0.2s ease",
    borderRadius: "12px",
  }

  const timeStampStyle = {
    fontSize: "0.75rem",
    opacity: 0.7,
  }

  const scrollableAreaStyle = {
    maxHeight: "500px", 
    overflowY: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: "#E9ECEF transparent"
  }

  const customHrStyle = {
    border: 0,
    height: "1px",
    backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0))",
    margin: "0.5rem 0"
  }

  const avatarStyle = {
    width: "50px", 
    height: "50px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  }

  return (
    <Card className="shadow-sm border-0" style={{ borderRadius: "15px" }}>
      <Card.Header className="bg-white border-bottom p-3" style={{ borderTopLeftRadius: "15px", borderTopRightRadius: "15px" }}>
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle bg-success d-flex align-items-center justify-content-center me-3"
            style={avatarStyle}
          >
            <span className="text-white fw-bold fs-4">{user.username.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h5 className="mb-0 fw-bold">{user.username}</h5>
            <small className="text-muted">
              {messages.some((m) => m.status === "unread")
                ? `${messages.filter((m) => m.status === "unread").length} unread messages`
                : "All messages read"}
            </small>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="conversation-list p-3" style={scrollableAreaStyle}>
          {messages.map((msg, index) => (
            <div key={msg._id}>
              <div 
                className={`py-3 px-3 ${msg.status === "unread" ? "bg-light" : ""}`} 
                style={{
                  ...messageContainerStyle,
                  backgroundColor: msg.status === "unread" ? "#f8f9fa" : "transparent",
                  boxShadow: msg.status === "unread" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                  padding: "12px",
                  marginBottom: "8px"
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted" style={timeStampStyle}>
                    {new Date(msg.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
                <p className="mb-2 text-break" style={{ lineHeight: "1.5" }}>{msg.content}</p>
                {msg.status === "unread" && (
                  <div className="text-end">
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="rounded-pill px-3 py-1"
                      style={{ 
                        borderWidth: "1.5px", 
                        transition: "all 0.2s ease",
                        fontSize: "0.8rem"
                      }}
                      onClick={() => handleMarkAsRead(msg._id)}
                    >
                      <i className="bi bi-check2 me-1"></i>
                      Mark as Read
                    </Button>
                  </div>
                )}
              </div>
              {index < messages.length - 1 && <hr style={customHrStyle} />}
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  )
}

export default ConversationView