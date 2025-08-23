import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateUserInput } from '../utils/validation';
import "../style/LoginPage.css";

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
    <div id="loginpage-container">
      <div id="login-box">
        <h2 id="login-title">Welcome to Chat App</h2>

        <div id="form-container">
          {tab === "signup" && (
            <div className="form-group">
              <label className="form-label">Enter username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="username"
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Enter email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Your email"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Enter password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Your password"
              className="form-input"
            />
          </div>
        </div>

        <div id="button-group">
          {tab === "signup" ? (
            <button
              id="signup-btn"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Signing..." : "Signup"}
            </button>
          ) : (
            <button
              id="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          )}
          <button
            id="guest-btn"
            onClick={joinGuestHandler}
            disabled={loading}
          >
            Join as Guest
          </button>
        </div>

        <p
          id="toggle-tab"
          onClick={() => {
            setForm({ username: "", email: "", password: "" });
            setTab(tab === "signup" ? "login" : "signup");
          }}
        >
          {tab === "signup"
            ? "Already have an account? Login here"
            : "New User? Signup here"}
        </p>
      </div>
    </div>
  );
}