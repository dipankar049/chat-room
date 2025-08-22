import React, { useState, useEffect } from "react";
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

  // Load user
  useEffect(() => {
    const storedUser = sessionStorage.getItem("chat-room-user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setUser(userObj);

      if (!socket.connected) {
        socket.auth = { username: userObj.username };
        socket.connect();
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);


  // Join room after socket connected
  useEffect(() => {
    if (!user || !room) return;

    socket.emit("joinRoom", { roomName: room, username: user.username }, (res) => {
      if (res.success) setMessages(res.history);
      else console.error(res.error);
    });
  }, [user, room]);

  // Socket listeners
  useEffect(() => {
    const handleReceiveMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const handleUpdateUsers = (userList) => setUsers(userList);
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

  return (
    <div className="flex h-screen">
      {/* Chat section */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white shadow flex justify-between items-center">
          <h2 className="font-bold text-lg">Room: {room}</h2>
          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-500">
              {typingUsers.join(", ")} typing...
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-2 ${msg.senderName === user?.username ? "text-right" : "text-left"}`}
            >
              <span className="font-bold">{msg.senderName}: </span>
              <span>{msg.text}</span>
              <div className="text-xs text-gray-500">
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="p-2 flex">
          <input
            value={newMessage}
            onChange={handleTyping}
            className="flex-1 border p-2 rounded"
            placeholder="Type a message..."
          />
          <button onClick={handleSend} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
            Send
          </button>
        </div>
      </div>

      {/* Users list */}
      <div className="w-60 bg-white border-l p-4">
        <h2 className="font-bold mb-2">Online Users</h2>
        <ul>
          {users.map((u, i) => (
            <li key={i} className="py-1 border-b">
              {u}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
