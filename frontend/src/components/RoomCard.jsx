import { socket } from "../socket/socket";

export default function RoomCard({ room, user, setRoom, navigate }) {
  const handleJoinRoom = () => {
    if (!room?.name) return alert("Room name required");

    socket.auth = { username: user.username };

    if (!socket.connected) {
      socket.connect();
      socket.once("connect", () => {
        socket.emit("joinRoom", { roomName: room.name, username: user.username }, (response) => {
          if (response.success) {
            setRoom(room.name);
            navigate(`/chat/${room.name}`);
          } else {
            alert(response.error || "Failed to join room");
          }
        });
      });
    } else {
      socket.emit("joinRoom", { roomName: room.name, username: user.username }, (response) => {
        if (response.success) {
          setRoom(room.name);
          navigate(`/chat/${room.name}`);
        } else {
          alert(response.error || "Failed to join room");
        }
      });
    }
  };

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow">
      <div>
        <div className="text-lg font-medium text-gray-800">{room.name}</div>
        <div className="text-sm text-gray-500">
          Owner: {room.owner ? room.owner.username : room.guestOwnerId || "Unknown"}
        </div>
      </div>
      <button onClick={handleJoinRoom} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Join
      </button>
    </div>
  );
}
