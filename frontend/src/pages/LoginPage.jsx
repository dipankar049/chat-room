import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage({ setUser }) {
  const [tab, setTab] = useState("login");
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleGuest = () => {
    navigate("/home", { replace: true });
  };

  const validation = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (regex.test(form.email) && form.password.length > 3) return true;
    console.log("Fill all inputs");
    return false;
  };

  const handleLogin = async() => {
    if (!validation()) return;

    axios.post("http://localhost:8000/user/login", form)
    .then((res) => {
      setUser(res.data.user);
      sessionStorage.setItem("chat-room-token", res.data.token);
      sessionStorage.setItem("chat-room-user", JSON.stringify(res.data.user));
      navigate("/home", { replace: true });
      console.log("Login successfull");
    })
    .catch((err) => {
      console.log("Error occured during login",err);
    });
  };

  const handleSignup = async() => {
    if (!validation()) return;
    
    if(form.username.trim()) {
      axios.post("http://localhost:8000/user/signup", form)
      .then(() => {
        setForm({ username: "", email: "", password: "" });
        setTab("login");
        console.log("Signup successfull");
      })
      .catch((err) => {
        console.log("Signup failed", err);
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Welcome to Chat App</h2>

        <div className="space-y-2">
          {tab === "signup" &&
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-600">
                Enter username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value})}
                placeholder="username"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          }
          <label htmlFor="name" className="block text-sm font-medium text-gray-600">
            Enter email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            placeholder="Your email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label htmlFor="name" className="block text-sm font-medium text-gray-600">
            Enter password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
            placeholder="Your password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {tab === "signup" ? 
            <button
              onClick={handleSignup}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Signup
            </button>
            : <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </button>
          }
          <button
            onClick={handleGuest}
            className="w-full border border-gray-400 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
          >
            Join as Guest
          </button>
        </div>
        <p onClick={() => {
              setForm({ username: "", email: "", password: "" });
              if(tab === "signup") setTab("login");
              else setTab("signup");
            }
          }>
          {tab === "signup" ? "Already have an account? Login here" : "New User? Signup here"}
        </p>
      </div>
    </div>
  );
}