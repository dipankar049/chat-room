import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateUserInput } from '../utils/validation';

export default function LoginPage({ setUser }) {
  const [tab, setTab] = useState("login");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const joinGuestHandler = () => {
    const username = `Guest${Math.floor(10000 + Math.random() * 90000)}`;

    const guestId = `guest-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const guestUser = { username, isGuest: true, guestId };

    sessionStorage.setItem("chat-room-user", JSON.stringify(guestUser));

    setUser(guestUser);

    navigate("/home", { replace: true });
  };

  const handleLogin = async () => {
    if (!validateUserInput({ email: form.email, username: "user", password: form.password }).valid) {
      alert("Invalid credentials");
      return;
    }
    setLoading(true);
    axios.post(`${import.meta.env.VITE_NODE_URI}/user/login`, form)
      .then((res) => {
        setUser(res.data.user);
        sessionStorage.setItem("chat-room-token", res.data.token);
        sessionStorage.setItem("chat-room-user", JSON.stringify(res.data.user));

        navigate("/home", { replace: true });
        console.log("Login successful");
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || "Something went wrong";
        alert(errorMsg);
        console.log("Error occurred during login:", errorMsg, err);
      }).finally(() => {
        setLoading(false);
      });
  };

  const handleSignup = async () => {
    if (!validateUserInput({ email: form.email, username: form.username, password: form.password }).valid) {
      alert("Invalid credentials");
      return;
    }
    setLoading(true);
    axios.post(`${import.meta.env.VITE_NODE_URI}/user/signup`, form)
      .then(() => {
        setForm({ username: "", email: "", password: "" });
        setTab("login");
        console.log("Signup successful");
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || "Something went wrong";
        alert(errorMsg);
        console.log("Error occurred during sing up:", errorMsg, err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Welcome to Chat App
        </h2>

        <div className="space-y-2">
          {tab === "signup" &&
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Enter username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="username"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          }
          <label className="block text-sm font-medium text-gray-600">
            Enter email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Your email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label className="block text-sm font-medium text-gray-600">
            Enter password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Your password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {tab === "signup" ?
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Signing..." : "Signup"}
            </button>
            : <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          }
          <button
            onClick={joinGuestHandler}
            disabled={loading}
            className="w-full border border-gray-400 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
          >
            Join as Guest
          </button>
        </div>

        <p
          onClick={() => {
            setForm({ username: "", email: "", password: "" });
            setTab(tab === "signup" ? "login" : "signup");
          }}
          className="cursor-pointer text-sm text-blue-500 text-center"
        >
          {tab === "signup"
            ? "Already have an account? Login here"
            : "New User? Signup here"}
        </p>
      </div>
    </div>
  );
}