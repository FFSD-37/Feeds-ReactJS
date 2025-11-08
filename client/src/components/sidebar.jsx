import React, { useState } from "react";
import "./../styles/sidebar.css";
import { useUserData } from "./../providers/userData.jsx";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const { userData, setUserData } = useUserData();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleDropdown = () => setShowDropdown(prev => !prev);
  const toggleLogoutModal = () => setShowLogoutModal(prev => !prev);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok || res.status === 401) {
        setUserData({});
        navigate("/login", { replace: true });
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setTimeout(() => navigate("/login", { replace: true }), 300);
    }
  };

  const { username, channelName, profileUrl, type, isPremium } = userData || {};
  
  // Sidebar items
  const allItems = [
    { name: "Home", href: "/home", icon: "/Images/Home.svg" },
    { name: "Notifications", href: "/notifications", icon: "/Images/Notifications.svg" },
    { name: "Create", href: "/create_post", icon: "/Images/Create.svg" },
    { name: "Chat", href: "/chat", icon: "/Images/Chat.svg" },
    { name: "Connect", href: "/connect", icon: "/Images/Connect.svg" },
    { name: "Stories", href: "/stories", icon: "/Images/Stories.svg" },
    { name: "Reels", href: "/reels", icon: "/Images/Reels.svg" },
    { name: "Game", href: "/games", icon: "/Images/Game.svg" },
    { name: "Premium", href: "/payment", icon: "/Images/Premium.svg" },
  ];

  const channelItems = [
    { name: "Home", href: "/home", icon: "/Images/Home.svg" },
    { name: "Notifications", href: "/notifications", icon: "/Images/Notifications.svg" },
    { name: "Create", href: "/create_post", icon: "/Images/Create.svg" },
    { name: "Chat", href: "/chat", icon: "/Images/Chat.svg" },
    { name: "Connect", href: "/connect", icon: "/Images/Connect.svg" },
    { name: "Reels", href: "/reels", icon: "/Images/Reels.svg" },
  ];

  const kidsItems = allItems.filter(item =>
    ["Home", "Connect", "Reels", "Game"].includes(item.name)
  );

  // Select which items to show
  const filteredItems =
    type === "Kids" ? kidsItems : type === "Channel" ? channelItems : allItems;

  // Determine profile link
  const profileLink =
    type === "Channel"
      ? `/channel/${channelName}`
      : `/profile/${username}`;

  return (
    <>
      <div className="sidebar">
        {/* Main Nav Icons */}
        {filteredItems.map(item => (
          <div key={item.name} className="icon-container">
            <a href={item.href} className="nav-item">
              <img
                src={item.icon}
                alt={item.name}
                className="icon-img"
                width="30"
                height="30"
              />
            </a>
            <span className="sidebar_tooltip">{item.name}</span>
          </div>
        ))}

        {/* Menu Icon */}
        <div className="icon-container" onClick={toggleDropdown}>
          <div className="nav-item">
            <img
              src="/Images/Menu.svg"
              alt="Menu"
              className="icon-img"
              width="30"
              height="30"
            />
          </div>
          <span className="sidebar_tooltip">Menu</span>
        </div>

        {/* Profile Section */}
        {(username || channelName) && (
          <div className="profile">
            <a href={profileLink} className="nav-item profile-pic-anchor">
              <img
                src={profileUrl || "/Images/default_user.jpeg"}
                alt="Profile"
                className="sidebar-profile-pic"
              />
            </a>
          </div>
        )}

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="profile-dropdown show">
            <a href="/edit_profile">Edit Profile</a>
            <a href="/dailyUsage">See Daily Usage</a>
            <a href="/settings">Settings</a>
            <a href="#" onClick={toggleLogoutModal}>
              Logout
            </a>
            <a href="/help">Help & Support</a>
            <a href="/delacc">Delete Account</a>
          </div>
        )}
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          className="modal-overlay active"
          onClick={(e) => {
            if (e.target === e.currentTarget) toggleLogoutModal();
          }}
        >
          <div className="logout-modal">
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to log out from your account?</p>
            <div className="buttons">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
              <button className="cancel-btn" onClick={toggleLogoutModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
