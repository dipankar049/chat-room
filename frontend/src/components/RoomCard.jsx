import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import "../style/RoomCard.css";
import axios from "axios";
import { toast } from "react-toastify";

export default function RoomCard({ room, user, setRoom, navigate, tab, setRoomsList }) {
  const [noOfUsers, setNoOfUsers] = useState(0);
  const [ deletingRoom, setDeletingRoom ] = useState(false);

  useEffect(() => {
    if (!room?.name) return;

    const fetchUsers = () => {
      socket.emit("getRoomUsers", room.name, (response) => {
        // console.log("Initial users:", response);
        if (response?.count !== undefined) {
          setNoOfUsers(response.count);
        }
      });
    };

    if (socket.connected) {
      fetchUsers();
    } else {
      socket.once("connect", fetchUsers);
    }

    return () => {
      socket.off("connect", fetchUsers);
    };
  }, [room?.name]);


  useEffect(() => {
    if (!room?.name) return;

    const handleUpdateUsers = ({ roomName, count }) => {
      // console.log(room.name, roomName, count)
      if (roomName == room.name) {
        // console.log(`Room ${roomName} has ${count} users`);
        setNoOfUsers(count);
      }
    };

    socket.on("updateUsers", handleUpdateUsers);

    return () => {
      socket.off("updateUsers", handleUpdateUsers);
    };
  }, [room?.name]);

  const handleJoinRoom = () => {
    if (!room?.name) return alert("Room name required");

    // socket.emit("joinRoom", { roomName: room.name, username: user.username }, (res) => {
    //   if (res.success) {
    //     setRoom(room.name);
    navigate(`/chat/${room.name}`);
    //   } else {
    //     alert(res.error || "Failed to join room");
    //   }
    // });
  };

  const handleDeleteRoom = (roomName, roomId) => {
    toast(
      ({ closeToast }) => (
        <div style={{ padding: "6px" }}>
          <p>Delete <strong>{roomName}</strong>?</p>

          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button
              style={{ background: "red", color: "white", padding: "4px 8px", borderRadius: "4px" }}
              onClick={() => confirmDelete(roomId, closeToast)}
            >
              Yes, Delete
            </button>

            <button
              style={{ background: "#999", color: "white", padding: "4px 8px", borderRadius: "4px" }}
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const confirmDelete = async (roomId, closeToast) => {
    setDeletingRoom(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_NODE_URI}/room/delete`,
        {
          data: {
            roomId,
            username: user.username
          }
        }
      );

      toast.success("Room Deleted");

      // Update UI instantly
      setRoomsList(prev => prev.filter(r => r._id !== roomId));

      closeToast();
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to delete room");
    } finally {
      setDeletingRoom(false);
    }
  };



  return (
    <div className="roomcard-container">
      <div className="roomcard-info">
        <div className="roomcard-name">{room.name}</div>
        <div className="roomcard-owner">
          Owner: {room?.owner?.username === user.username ? 'You' : room?.owner?.username || "Unknown"}
        </div>
        <div className="roomcard-users">Users Online: {noOfUsers}</div>
      </div>
      <div>
        {tab === 'mine' &&
          <button
            className="roomcard-join-btn"
            style={{ backgroundColor: 'red' }}
            onClick={() => handleDeleteRoom(room.name, room._id)}
            disabled={deletingRoom}
          >
            {deletingRoom ? "Deleting..." : "Delete"}
          </button>
        }
        <button className="roomcard-join-btn" onClick={handleJoinRoom}>
          Join
        </button>
      </div>
    </div>
  );
}
