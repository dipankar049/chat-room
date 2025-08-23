import axios from "axios";

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
  const handleCreateRoom = async () => {
    if (!newRoom) {
      return alert("Room name is required");
    }

    try {
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
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50 px-6">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-700">Create New Room</h2>
        <input
          type="text"
          placeholder="Room Name"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        {/* <input
          type="password"
          placeholder="Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        /> */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
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
  );
}
