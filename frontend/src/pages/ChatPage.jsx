import { useEffect, useState, useRef } from "react";
import { socket } from '../socket/socket';

function ChatPage({ room }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("sendMessage", message);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-100 p-4">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-center mb-4 text-blue-800">
          Room: {room}
        </h2>

        {/* Chat Box */}
        <div className="bg-white rounded-lg shadow-md p-4 h-[60vh] overflow-y-auto space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.system ? (
                <p className="text-sm text-center text-gray-500 italic">🔔 {msg.message}</p>
              ) : (
                <div className="bg-blue-100 rounded-lg p-2">
                  <div className="text-sm font-semibold text-blue-800">{msg.username}</div>
                  <div className="text-gray-700">{msg.message}</div>
                  <div className="text-xs text-gray-400 text-right">{msg.time}</div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;