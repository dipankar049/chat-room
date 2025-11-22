import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateUserInput } from '../utils/validation';
import "../style/LoginPage.css";
import { toast } from 'react-toastify';
import { signInWithGoogle } from "../firebase/auth";

export default function LoginPage({ setUser }) {
  const [tab, setTab] = useState("login");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleLogin = async () => {

    const isValidate = validateUserInput({ email: form.email, username: "user", password: form.password });
    if (isValidate.message !== "") {
      toast.error(isValidate.message || "Invalid credentials");
      return;
    }

    setLoading(true);
    axios.post(`${import.meta.env.VITE_NODE_URI}/user/login`, form)
      .then((res) => {
        setUser(res.data.user);
        sessionStorage.setItem("chat-room-token", res.data.token);
        sessionStorage.setItem("chat-room-user", JSON.stringify(res.data.user));

        navigate("/home", { replace: true });
        toast.success("Login successful");
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || "Something went wrong";
        toast.error(errorMsg);
      }).finally(() => {
        setLoading(false);
      });
  };

  const handleSignup = async () => {
    const isValidate = validateUserInput({ email: form.email, username: form.username, password: form.password });
    if (isValidate.message !== "") {
      toast.error(isValidate.message || "Invalid credentials");
      return;
    }

    setLoading(true);
    axios.post(`${import.meta.env.VITE_NODE_URI}/user/signup`, form)
      .then(() => {
        setForm({ username: "", email: "", password: "" });
        setTab("login");
        toast.success("Signup successful");
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || "Something went wrong";
        toast.error(errorMsg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFirebaseLogin = async () => {
    const loggedInUser = await signInWithGoogle();

    if (loggedInUser) {
      const userInfo = {
        uid: loggedInUser.uid,
        email: loggedInUser.email,
        username: loggedInUser.displayName || "Anonymous",
        profilePhoto_url: loggedInUser.photoURL,
      };

      setLoading(true);
      axios.post(`${import.meta.env.VITE_NODE_URI}/user/googleLogin`, userInfo)
      .then((res) => {
        setUser(res.data.user);
        sessionStorage.setItem("chat-room-token", res.data.token);
        sessionStorage.setItem("chat-room-user", JSON.stringify(res.data.user));

        navigate("/home", { replace: true });
        toast.success("Login successful");
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || "Something went wrong";
        toast.error(errorMsg);
      }).finally(() => {
        setLoading(false);
      });
    }
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
            className="google-login-btn"
            onClick={handleFirebaseLogin}
            disabled={loading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google Logo"
              className="google-icon"
            />
            <span>Sign in with Google</span>
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