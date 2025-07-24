import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from '../socket/socket';

export default function ChatPage() {
  const location = useLocation();
  const room = location.state?.room;
  const username = location.state?.username;
  const history = location.state?.history ?? [];

  const [messages, setMessages] = useState(history);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const handleSend = () => {
    if (newMessage.trim()) {
      socket.emit("sendMessage", newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2 font-semibold">Room: {room}</h2>
      <div className="border rounded p-2 h-96 overflow-y-auto bg-white shadow">
        {messages.map((msg, i) => (
          <div key={i} className={msg.system ? "text-gray-500 text-sm" : ""}>
            {msg.system ? (
              <div>[{msg.time}] {msg.message}</div>
            ) : (
              <div>
                <strong>{msg.username === username ? "You" : msg.username}</strong> [{msg.time}]: {msg.message}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex">
        <input
          className="border flex-1 p-2 rounded-l"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
}