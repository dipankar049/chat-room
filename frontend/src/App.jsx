import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';
import { socket } from "./socket/socket";
import { ToastContainer, toast } from 'react-toastify';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("chat-room-user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [room, setRoom] = useState("");

  const ProtectedRoutes = ({ children }) => {
    if (!user) return <Navigate to="/" replace />;
    return children;
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    return () => socket.disconnect();
  }, []);


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage setUser={setUser} />} />
        <Route
          path="/home"
          element={
            <ProtectedRoutes>
              <HomePage
                setUser={setUser}
                user={user}
                room={room}
                setRoom={setRoom}
              />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/chat/:room"
          element={
            <ProtectedRoutes>
              <ChatPage room={room} username={username} />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoutes>
              <ProfilePage user={user} setUser={setUser} setRoom={setRoom} />
            </ProtectedRoutes>
          }
        />
      </Routes>
      <ToastContainer autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
