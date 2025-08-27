import axios from "axios";
import "../style/CreateRoomPage.css";
import { useState } from "react";
import { socket } from "../socket/socket";

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
    if (!newRoom) {
      return alert("Room name is required");
    }

    try {
      setLoading(true);
      const body = {
        name: newRoom,
        // password: newPassword,
        type: "public",
        ownerId: user.isGuest ? null : user.id,
        guestOwnerId: user.isGuest ? user.guestId : null,
        ownerName: user.username,
      };

      const createRes = await axios.post(`${import.meta.env.VITE_NODE_URI}/room`, body);

      if (createRes.status === 201) {
        const createdRoom = createRes.data;
        socket.emit("roomCreated", createdRoom);

        // auto join after create
        const res = await axios.post(`${import.meta.env.VITE_NODE_URI}/room/joinByName`, {
          roomName: createdRoom.name,
          // password: newPassword,
          username: user.username,
        });

        if (res.status === 200) {
          const { history } = res.data;

          setRoom(createdRoom.name);
          onClose();

          navigate(`/chat/${createdRoom.name}`, {
            state: { history, room: createdRoom.name, username: user.username },
          });
        }
      } else {
        alert("Room creation failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
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