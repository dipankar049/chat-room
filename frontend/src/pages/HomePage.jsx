import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, PlusCircle } from "lucide-react";
import axios from "axios";

import RoomCard from "../components/RoomCard";
import CreateRoomModal from "../components/CreateRoomModal";
import JoinRoomModal from "../components/JoinRoomModal";

export default function HomePage({ setUser, user, setRoom }) {
  const navigate = useNavigate();

  const [roomsList, setRoomsList] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [newRoom, setNewRoom] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_NODE_URI}/room`);
        setRoomsList(res.data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    }
    fetchRooms();
  }, []);

  const handleLogout = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("chat-room-user"));
      if (user?.isGuest && user?.createdRoomId) {
        await fetch(`${import.meta.env.VITE_NODE_URI}/rooms/${user.createdRoomId}`, {
          method: "DELETE",
        });
      }
      sessionStorage.removeItem("chat-room-token");
      sessionStorage.removeItem("chat-room-user");
      setUser(null);
      setRoom(null);
      navigate("/");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome {user.username}</h1>
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
          roomsList.map((room, idx) => (
            <RoomCard
              key={idx}
              room={room}
              user={user}
              setRoom={setRoom}
              navigate={navigate}
            // onJoin={() => {
            //   setSelectedRoom(room.name);
            //   setShowJoinModal(true);
            // }}
            />
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateRoomModal
          newRoom={newRoom}
          setNewRoom={setNewRoom}
          // newPassword={newPassword}
          // setNewPassword={setNewPassword}
          user={user}
          setRoom={setRoom}
          onClose={() => setShowCreateModal(false)}
          navigate={navigate}
        />
      )}

      {/* Join Modal */}
      {/* {showJoinModal && (
        <JoinRoomModal
          selectedRoom={selectedRoom}
          // joinPassword={joinPassword}
          // setJoinPassword={setJoinPassword}
          user={user}
          setRoom={setRoom}
          onClose={() => setShowJoinModal(false)}
          navigate={navigate}
        />
      )} */}
    </div>
  );
}
