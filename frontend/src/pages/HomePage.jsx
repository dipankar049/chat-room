import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket/socket';
import { LogOut, PlusCircle } from 'lucide-react';

export default function HomePage({ username, setRoom }) {
  const navigate = useNavigate();

  const [roomsList, setRoomsList] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [newRoom, setNewRoom] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [selectedRoom, setSelectedRoom] = useState('');
  const [joinPassword, setJoinPassword] = useState('');

  useEffect(() => {
    socket.emit("getRooms");

    socket.on("roomsList", (data) => {
      setRoomsList(data);
    });

    return () => socket.off("roomsList");
  }, []);

  const handleCreateRoom = () => {
    socket.emit("createRoom", { room: newRoom, password: newPassword }, (response) => {
      if (response.success) {
        // After creation, now JOIN the room
        socket.emit("joinRoom", { username, room: newRoom, password: newPassword }, (res) => {
          if (res.success) {
            setRoom(newRoom);
            setShowCreateModal(false);
            navigate('/chat', { replace: true });
          } else {
            alert(res.message);
          }
        });
      } else {
        alert(response.message);
      }
    });
  };

  const handleJoinRoom = () => {
    socket.emit(
      "joinRoom",
      { username, room: selectedRoom, password: joinPassword },
      (response) => {
        if (response.success) {
          setRoom(selectedRoom);
          setShowJoinModal(false);
          // ✅ Send chat history and room to /chat via navigate state
          navigate("/chat", {
            replace: true,
            state: { history: response.history, room: selectedRoom, username },
          });
        } else {
          alert(response.message);
        }
      }
    );
  };

  const handleLogout = async() => {

  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="flex text-2xl font-bold text-gray-800">Welcome {username || 'Guest'}</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Room
          </button>
        </div>
      </div>

      {/* Room List */}
      <div className="grid gap-4">
        {roomsList.length === 0 ? (
          <p className="text-gray-500">No rooms available.</p>
        ) : (
          roomsList.map((roomName, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-white p-4 rounded-xl shadow"
            >
              <div className="text-lg font-medium text-gray-800">{roomName}</div>
              <button
                onClick={() => {
                  setSelectedRoom(roomName);
                  setShowJoinModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Join
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Create New Room</h2>
            <input
              type="text"
              placeholder="Room Name"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Enter Password for "{selectedRoom}"</h2>
            <input
              type="password"
              placeholder="Room Password"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinRoom}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}