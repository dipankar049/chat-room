import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LoginPage setUsername={setUsername} />} />
          <Route path='/home' element={<HomePage username={username} room={room} setRoom={setRoom}  />} />
          <Route path='/chat' element={<ChatPage room={room} username={username} />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
