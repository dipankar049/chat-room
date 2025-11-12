import axios from "axios";
import "../style/CreateRoomPage.css";
import { useState } from "react";
import { socket } from "../socket/socket";
import { toast } from "react-toastify";

export default function CreateRoomModal({
  newRoom,
  setNewRoom,
  // newPassword,
  // setNewPassword,
  user,
  setRoom,
  onClose,
  navigate,
}) {

  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!newRoom) return alert("Room name is required");

    setLoading(true);
    const body = {
      name: newRoom,
      type: "public",
      ownerId: user.id,
      ownerName: user.username,
    };

    try {
      const createRes = await axios.post(`${import.meta.env.VITE_NODE_URI}/room`, body);
      toast.success("Room created successfully");

      const createdRoom = createRes.data;
      socket.emit("roomCreated", createdRoom);

      // auto join after create
      joinRoom(createdRoom);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Room creation failed");
    } finally {
      setLoading(false);
      onClose();
      setNewRoom("");
    }
  };

  const joinRoom = async (createdRoom) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_NODE_URI}/room/joinByName`, {
        roomName: createdRoom.name,
        username: user.username,
      });

      const { history } = res.data;

      setRoom(createdRoom.name);

      navigate(`/chat/${createdRoom.name}`, {
        state: { history, room: createdRoom.name, username: user.username },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to join room");
    }
  };

  return (
    <div id="create-room-overlay">
      <div id="create-room-box">
        <h2 id="create-room-title">Create New Room</h2>
        <input
          type="text"
          placeholder="Room Name"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          className="create-room-input"
        />
        {/* <input
        type="password"
        placeholder="Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="create-room-input"
      /> */}
        <div id="create-room-buttons">
          <button id="cancel-btn" disabled={loading} onClick={onClose}>Cancel</button>
          <button id="create-btn" disabled={loading} onClick={handleCreateRoom}>{loading ? "Creating..." : "Create"}</button>
        </div>
      </div>
    </div>
  );
}