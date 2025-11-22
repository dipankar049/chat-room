import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../style/ProfilePage.css";
import { logout } from "../firebase/auth";

export default function ProfilePage({ user, setUser, setRoom }) {
  const navigate = useNavigate();

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

  const firstLetter = user.username?.charAt(0)?.toUpperCase() || "?";
  const formattedDate = new Date(user.joinedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="profile-container">
      <div className="profile-card">
        {user.profilePhoto_url && user.profilePhoto_url.trim() !== "" ? (
          <img
            src={user.profilePhoto_url}
            alt="Profile"
            className="profile-avatar-img"
            onError={(e) => (e.target.style.display = "none")} // hides if invalid photo URL
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