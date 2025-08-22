import axios from "axios";
import { socket } from "../socket/socket";
import { useEffect } from "react";

export default function JoinRoomModal({
  selectedRoom,
  // joinPassword,
  // setJoinPassword,
  user,
  setRoom,
  onClose,
  navigate,
}) {
  const handleJoinRoom = async () => {
    if (!selectedRoom) return alert("Room name required");

    if (!socket.connected) socket.connect();

    socket.emit(
      "joinRoom",
      {
        roomName: selectedRoom,
        username: user.username,
        // password: joinPassword,
      },
      (response) => {
        if (response.success) {
          setRoom(selectedRoom);
          onClose();
          navigate(`/chat`); // pass via URL param
        } else {
          alert(response.error || "Failed to join room");
        }
      }
    );
  };

  useEffect(() => {
    if (selectedRoom) {
      handleJoinRoom();
    }
  }, [selectedRoom]);
  

  // return (
  //   <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
  //     <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
  //       {/* <h2 className="text-xl font-semibold text-gray-700">
  //         Enter Password for "{selectedRoom}"
  //       </h2> */}
  //       {/* <input
  //         type="password"
  //         placeholder="Room Password"
  //         value={joinPassword}
  //         onChange={(e) => setJoinPassword(e.target.value)}
  //         className="w-full border rounded px-3 py-2"
  //       /> */}
  //       <div className="flex justify-end space-x-2 pt-2">
  //         <button
  //           onClick={onClose}
  //           className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
  //         >
  //           Cancel
  //         </button>
  //         <button
  //           onClick={handleJoinRoom}
  //           className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
  //         >
  //           Join
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );
}
