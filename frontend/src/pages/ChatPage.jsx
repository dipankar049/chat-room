import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import "../style/ChatPage.css";
import { toast } from "react-toastify";

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
  const [isSending, setIsSending] = useState(false);

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

  useEffect(() => {
    if (!user || !room) return;

    let timeoutId;
    let joined = false;

    // Handle socket connection errors
    const handleConnectError = (error) => {
      console.error("Socket connection error:", error);
      setLoading(false);
      toast.error("Connection failed. Please try again.");
      navigate('/home');
    };

    const handleDisconnect = () => {
      if (!joined) {
        console.error("Disconnected before joining room");
        setLoading(false);
        toast.error("Lost connection to server");
        navigate('/home');
      }
    };

    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    // Timeout fallback
    timeoutId = setTimeout(() => {
      if (!joined) {
        setLoading(false);
        toast.error("Connection timeout");
        navigate('/home');
      }
    }, 10000);

    // Emit join
    socket.emit("joinRoom",
      { roomName: room, username: user.username, userId: user.id },
      (res) => {
        clearTimeout(timeoutId);

        if (res?.success) {
          joined = true;
          setMessages(res.history);
          setLoading(false);
        } else {
          setLoading(false);
          toast.error(res?.error || "Failed to join room");
          navigate('/home');
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
    };
  }, [user, room]);

  // Socket listeners
  useEffect(() => {
    const handleReceiveMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const handleUpdateUsers = ({ userList }) => setUsers(userList);
    const handleUserTyping = ({ username, userId }) => {
      setTypingUsers((prev) => {
        const alreadyTyping = prev.some((u) => u.userId === userId);
        if (alreadyTyping) return prev;
        return [...prev, { userId, username }];
      });
    };

    const handleUserStopTyping = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    const handleRemoveRoom = ({ roomName }) => {
      if (room === roomName) {
        navigate('/home', { replace: true });
        toast.info(`${roomName} room is not available`);
      }
    }

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("updateUsers", handleUpdateUsers);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStopTyping", handleUserStopTyping);
    socket.on("roomRemoved", handleRemoveRoom);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("updateUsers", handleUpdateUsers);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
      socket.off("roomRemoved", handleRemoveRoom);
    };
  }, []);

  // Send message
  const handleSend = () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    // Add optimistic message
    const optimisticMessage = {
      _id: tempId,
      text: messageText,
      senderName: user.username,
      senderId: user.id,
      createdAt: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    socket.emit("sendMessage", { text: messageText }, (response) => {
      if (response?.success) {
        // Replace temp message with real one from server
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId
              ? { ...response.message, status: "sent" }
              : msg
          )
        );
        socket.emit("stopTyping");
      } else {
        // Mark as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId
              ? { ...msg, status: "failed" }
              : msg
          )
        );
        toast.error(response?.error || "Failed to send message");
      }
    });
  };

  // Listen for status updates
  useEffect(() => {
    // Message delivered (saved to DB)
    // const handleMessageDelivered = ({ messageId, status }) => {
    //   setMessages((prev) =>
    //     prev.map((msg) =>
    //       msg._id.toString() === messageId
    //         ? { ...msg, status }
    //         : msg
    //     )
    //   );
    // };

    // Message failed to save
    const handleMessageFailed = ({ messageId, status, error }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id.toString() === messageId
            ? { ...msg, status }
            : msg
        )
      );
      toast.error(error || "Message delivery failed");
    };

    // socket.on("messageDelivered", handleMessageDelivered);
    socket.on("messageFailed", handleMessageFailed);

    return () => {
      // socket.off("messageDelivered", handleMessageDelivered);
      socket.off("messageFailed", handleMessageFailed);
    };
  }, []);

  const typingTimeoutRef = useRef(null);

  // Typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (e.target.value.length > 0) {
      socket.emit("typing");

      clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping");
      }, 2000);
    } else {
      socket.emit("stopTyping");
      clearTimeout(typingTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (user && room) {
        socket.emit("leaveRoom", { roomName: room, username: user.username, userId: user.id });
      }
    };
  }, [user, room]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && room) {
        socket.emit("leaveRoom", { roomName: room, username: user.username, userId: user.id });
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
            {typingUsers?.length > 0 && (
              <div id="typing-text">
                {typingUsers.map(u => u.username).join(", ")} typing...
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

                const isCurrentUser = msg.senderId === user?.id;
                return (
                  <div
                    key={msg._id || i}
                    className={`message-wrapper ${isCurrentUser ? "current-user" : "other-user"}`}
                  >
                    <div className={`message-bubble ${isCurrentUser ? "current-user-bubble" : "other-user-bubble"}`}>
                      {!isCurrentUser && <p className="sender-name">{msg.senderName}</p>}
                      <p className="message-text">{msg.text}</p>
                    </div>
                    <div className="message-footer">
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isCurrentUser && (
                        <span className={`message-status status-${msg.status || 'sent'}`}>
                          {msg.status === "sending" && "🕐"}
                          {msg.status === "sent" && "✓"}
                          {msg.status === "delivered" && "✓✓"}
                          {msg.status === "failed" && "❌"}
                        </span>
                      )}
                    </div>
                    {isCurrentUser && msg.status === "failed" && (
                      <button className="retry-button" onClick={() => retryMessage(msg)}>
                        Retry
                      </button>
                    )}
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
                {u.userId === user.id ? "You" : u?.username}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
