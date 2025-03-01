import { useState, useEffect } from "react"
import { Card, Badge, Button } from "react-bootstrap"

const ConversationView = ({ user, onMarkAsRead }) => {
  const [messages, setMessages] = useState(user.messages)

  // Reset messages when user changes
  useEffect(() => {
    setMessages(user.messages)
  }, [user])

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

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white border-bottom p-3">
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle bg-success d-flex align-items-center justify-content-center me-3"
            style={{ width: "50px", height: "50px" }}
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
        <div className="conversation-list p-3" style={{ maxHeight: "500px", overflowY: "auto" }}>
          {messages.map((msg) => (
            <div key={msg._id} className={`mb-3 ${msg.status === "unread" ? "bg-light p-3 rounded" : ""}`}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Badge bg={msg.status === "unread" ? "warning" : "secondary"} className="rounded-pill px-3 py-2">
                  {msg.status}
                </Badge>
                <small className="text-muted">
                  {new Date(msg.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
              <p className="mb-2 text-break">{msg.content}</p>
              {msg.status === "unread" && (
                <div className="text-end">
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="rounded-pill px-3 py-1"
                    onClick={() => handleMarkAsRead(msg._id)}
                  >
                    <i className="bi bi-check2 me-1"></i>
                    Mark as Read
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  )
}

export default ConversationView
