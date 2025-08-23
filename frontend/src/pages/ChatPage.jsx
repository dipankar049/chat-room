import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import "../style/ChatPage.css";

export default function ChatPage() {
  const { room } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const [showUsers, setShowUsers] = useState(false);

  // Load user
  useEffect(() => {
    const storedUser = sessionStorage.getItem("chat-room-user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setUser(userObj);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Join room
  useEffect(() => {
    if (!user || !room) return;

    socket.emit("joinRoom", { roomName: room, username: user.username }, (res) => {
      if (res.success) {
        setMessages(res.history);
        setLoading(false);
      }
      else console.error(res.error);
    });
  }, [user, room]);

  // Socket listeners
  useEffect(() => {
    const handleReceiveMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const handleUpdateUsers = ({ userList }) => setUsers(userList);
    const handleUserTyping = (username) =>
      setTypingUsers((prev) => [...new Set([...prev, username])]);
    const handleUserStopTyping = (username) =>
      setTypingUsers((prev) => prev.filter((u) => u !== username));

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("updateUsers", handleUpdateUsers);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStopTyping", handleUserStopTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("updateUsers", handleUpdateUsers);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
    };
  }, []);

  // Send message
  const handleSend = () => {
    if (!newMessage.trim()) return;
    socket.emit("sendMessage", { text: newMessage });
    socket.emit("stopTyping");
    setNewMessage("");
  };

  // Typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (e.target.value.length > 0) socket.emit("typing");
    else socket.emit("stopTyping");
  };

  useEffect(() => {
    return () => {
      if (user && room) {
        socket.emit("leaveRoom", { roomName: room, username: user.username });
      }
    };
  }, [user, room]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && room) {
        socket.emit("leaveRoom", { roomName: room, username: user.username });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, room]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div id="chatpage-container">
      {/* Chat section */}
      <div id="chat-section">
        {/* Header */}
        <div id="chat-header">
          <h2 id="chat-room-name">{room}</h2>

          <div id="header-right">
            {typingUsers.length > 0 && (
              <div id="typing-text">
                {typingUsers.join(", ")} typing...
              </div>
            )}
            <button
              id="online-users-btn"
              onClick={() => setShowUsers(!showUsers)}
            >
              Online ({users?.length || 0})
            </button>
          </div>
        </div>

        {/* Messages */}
        <div id="messages-container">
          {loading ? (
            <div id="loading-messages">Loading messages...</div>
          ) : (
            <>
              {messages.map((msg, i) => {
                if (msg.system) {
                  return (
                    <div key={i} className="system-message">
                      {msg.text}
                    </div>
                  );
                }

                const isCurrentUser = msg.senderName === user?.username;
                return (
                  <div
                    key={i}
                    className={`message-wrapper ${isCurrentUser ? "current-user" : "other-user"}`}
                  >
                    <div className={`message-bubble ${isCurrentUser ? "current-user-bubble" : "other-user-bubble"}`}>
                      <span className="message-text">{msg.text}</span>
                    </div>
                    <div className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div id="chat-input-container">
          <input
            value={newMessage}
            onChange={handleTyping}
            id="chat-input"
            placeholder="Type a message..."
          />
          <button id="send-btn" onClick={handleSend}>Send</button>
        </div>
      </div>

      {/* Drawer for Online Users */}
      {showUsers && (
        <div id="online-users-drawer">
          <div id="drawer-header">
            <h2>Online Users</h2>
            <button id="close-drawer-btn" onClick={() => setShowUsers(false)}>Close</button>
          </div>
          <ul id="online-users-list">
            {users?.map((u, i) => (
              <li key={i} className="online-user">
                {u === user.username ? "You" : u}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
