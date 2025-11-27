import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../style/ProfilePage.css";
import { logout } from "../firebase/auth";
import { useState } from "react";

export default function ProfilePage({ user, setUser, setRoom }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleLogout = async () => {
    try {
      console.log("Logging out");
      // Sign out from Firebase (in case it was a Google login)
      await logout();

      sessionStorage.removeItem("chat-room-token");
      sessionStorage.removeItem("chat-room-user");
      setUser(null);
      setRoom(null);
      navigate("/");
    } catch (err) {
      console.error("Error during logout:", err);
      toast.error("Something went wrong");
    }
  };

  if (!user) {
    return <div className="profile-container">Loading...</div>;
  }

  const photoURL = user?.profilePhoto_url || "";
  const firstLetter = user.username?.charAt(0)?.toUpperCase() || "U";
  const formattedDate = new Date(user.joinedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="profile-container">
      <div className="profile-card">
        {photoURL && !imageError ? (
          <img
            src={photoURL}
            alt="Profile"
            className="profile-avatar-img"
            onError={() => setImageError(true)}  // triggers fallback
          />
        ) : (
          <div className="profile-avatar">{firstLetter}</div>
        )}
        <h2 className="profile-username">{user.username}</h2>
        <p className="profile-email">{user.email}</p>

        {/* <div className="profile-details"> */}
          <div className="profile-detail-item">
            <span className="value">Joined: {formattedDate}</span>
          </div>
        {/* </div> */}

        <button id="logout-btn" onClick={handleLogout}>
          <LogOut className="logout-icon" />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </div>
  );
}