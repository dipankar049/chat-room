import { useNavigate } from 'react-router-dom';
import { socket } from '../socket/socket';

export default function HomePage({ username, room, setRoom }) {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (room.trim() !== "") {
      socket.emit("joinRoom", { username, room });
      navigate('/chat', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Hello {username || 'Guest'}</h2>

        <div className="space-y-2">
          <label htmlFor="room" className="block text-sm font-medium text-gray-600">
            Enter Room Name
          </label>
          <input
            id="room"
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="e.g., tech-room"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          onClick={handleCreateRoom}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
        >
          Create & Join Room
        </button>
      </div>
    </div>
  );
}