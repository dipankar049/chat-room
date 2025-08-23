import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, PlusCircle } from "lucide-react";
import axios from "axios";
import "../style/HomePage.css";

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
  const [joinPassword, setJoinPassword] = useState("");
  const [Loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_NODE_URI}/room`);
        setRoomsList(res.data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  const handleLogout = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("chat-room-user"));
      console.log("Logging out")
      // if (user?.isGuest && user?.createdRoomId) {
      //   console.log("deleting out")
      //   await fetch(`${import.meta.env.VITE_NODE_URI}/rooms/${user.createdRoomId}`, {
      //     method: "DELETE",
      //   });
      // }
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
    <div id="homepage-container">
      {/* Header */}
      <div id="homepage-header">
        <h1 id="homepage-title">Chat Room</h1>
        <div id="header-buttons">
          <button
            id="create-room-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="create-room-text">Create Room</span>
          </button>
          <button
            id="logout-btn"
            onClick={handleLogout}
          >
            <LogOut className="logout-icon" />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Room List */}
      {Loading ? (
        <p id="loading-text">Loading rooms...</p>
      ) : (
        <div id="rooms-grid">
          {roomsList.length === 0 ? (
            <p id="no-rooms-text">No rooms available.</p>
          ) : (
            roomsList.map((room) => (
              <RoomCard
                key={room.name}
                room={room}
                user={user}
                setRoom={setRoom}
                navigate={navigate}
              />
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateRoomModal
          newRoom={newRoom}
          setNewRoom={setNewRoom}
          user={user}
          setRoom={setRoom}
          onClose={() => setShowCreateModal(false)}
          navigate={navigate}
        />
      )}
    </div>
  );
}
