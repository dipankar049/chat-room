import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
