import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";

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
    <div className="flex h-screen">
      {/* Chat section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-white shadow flex justify-between items-center">
          <h2 className="font-bold text-lg">{room}</h2>

          <div className="flex items-center gap-4">
            {typingUsers.length > 0 && (
              <div className="text-sm text-gray-500">
                {typingUsers.join(", ")} typing...
              </div>
            )}
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="ml-4 text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Online ({users?.length || 0})
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {loading ? (
            <div className="text-center text-sm text-gray-500 mt-[40vh]">Loading messages...</div>
          ) : (
            <>
            {messages.map((msg, i) => {
              if (msg.system) {
                // System message → small centered text
                return (
                  <div key={i} className="text-center text-xs text-gray-500 my-2">
                    {msg.text}
                  </div>
                );
              }

              // Normal messages
              const isCurrentUser = msg.senderName === user?.username;
              return (
                <div
                  key={i}
                  className={`mb-3 max-w-xs ${isCurrentUser ? "ml-auto text-right" : "mr-auto text-left"
                    }`}
                >
                  <div
                    className={`inline-block px-3 py-2 rounded-2xl break-words whitespace-pre-wrap max-w-full ${isCurrentUser
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-900 shadow"
                      }`}
                  >
                    <span className="block text-sm">{msg.text}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
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
        <div className="p-2 flex border-t bg-white">
          <input
            value={newMessage}
            onChange={handleTyping}
            className="flex-1 border p-2 rounded"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>

      {/* Drawer for Online Users */}
      {showUsers && (
        <div className="fixed right-0 top-0 h-full w-60 bg-white border-l p-4 shadow-lg z-50">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold">Online Users</h2>
            <button
              onClick={() => setShowUsers(false)}
              className="text-sm text-red-500 hover:underline"
            >
              Close
            </button>
          </div>
          <ul>
            {users?.map((u, i) => (
              <li key={i} className="py-1 border-b">
                {u === user.username ? "You" : u}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

}
