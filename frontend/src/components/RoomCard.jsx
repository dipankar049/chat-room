import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

export default function RoomCard({ room, user, setRoom, navigate }) {
  const [noOfUsers, setNoOfUsers] = useState(0);

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


  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow">
      <div>
        <div className="text-lg font-medium text-gray-800">{room.name}</div>
        <div className="text-sm text-gray-500">
          Owner: {room.owner ? room.owner.username : room.guestOwnerId || "Unknown"}
        </div>
        <div className="text-sm text-gray-500">Users Online: {noOfUsers}</div>
      </div>
      <button
        onClick={handleJoinRoom}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Join
      </button>
    </div>
  );
}
