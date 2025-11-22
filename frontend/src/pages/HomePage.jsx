import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, PlusCircle } from "lucide-react";
import axios from "axios";
import "../style/HomePage.css";
import { socket } from "../socket/socket";

import RoomCard from "../components/RoomCard";
import CreateRoomModal from "../components/CreateRoomModal";
import { toast } from "react-toastify";
import { useMemo } from "react";

export default function HomePage({ setUser, user, setRoom }) {
  const navigate = useNavigate();

  const [roomsList, setRoomsList] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [newRoom, setNewRoom] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [Loading, setLoading] = useState(false);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_NODE_URI}/room`);
        setRoomsList(res.data);
      } catch (err) {
        console.error("Error fetching rooms");
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  useEffect(() => {
    socket.on("newRoom", room => {
      setRoomsList(prev => [...prev, room]);
    });
    return () => socket.off("newRoom");
  }, []);

  useEffect(() => {
    socket.on("roomRemoved", ({ roomName }) => {
      // Remove room from the list
      setRoomsList(prev => prev.filter(r => r.name !== roomName));
    });

    return () => socket.off("roomRemoved");
  }, []);

  const filteredRooms = useMemo(() => {
    if (tab === "all") return roomsList;
    return roomsList.filter(room => room.owner === user.id);
  }, [roomsList, tab, user.id]);

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
            id="profile-btn"
            onClick={() => navigate('/profile')}
          >
            <p>{user.username?.charAt(0)?.toUpperCase() || 'P'}</p>
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div id="homepage-tabs">
        <button
          className={tab === "all" ? "active-tab" : "inactive-tab"}
          onClick={() => setTab("all")}
        >
          All Rooms
        </button>
        <button
          className={tab === "mine" ? "active-tab" : "inactive-tab"}
          onClick={() => setTab("mine")}
        >
          My Rooms
        </button>
      </div>

      {/* Room List */}
      {Loading ? (
        <p id="loading-text">Loading rooms...</p>
      ) : (
        <div id="rooms-grid">
          {filteredRooms.length === 0 ? (
            <p id="no-rooms-text">
              {tab === "all" ? "No rooms available." : "You haven't created any rooms yet."}
            </p>
          ) : (
            filteredRooms.map((room) => (
              <RoomCard
                key={room.name}
                room={room}
                user={user}
                setRoom={setRoom}
                navigate={navigate}
                tab={tab}
                setRoomsList={setRoomsList}
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
