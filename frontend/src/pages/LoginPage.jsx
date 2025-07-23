import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ setUsername }) {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleGuest = () => {
    setUsername("");
    navigate("/home", { replace: true });
  };

  const handleLogin = () => {
    if (name.trim()) {
      setUsername(name);
      navigate("/home", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Welcome to Chat App</h2>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-600">
            Enter your name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
          <button
            onClick={handleGuest}
            className="w-full border border-gray-400 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
          >
            Join as Guest
          </button>
        </div>
      </div>
    </div>
  );
}