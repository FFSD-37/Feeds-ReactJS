import React, { useState, useEffect, useRef } from 'react';
import './../styles/sidebar.css';

function Sidebar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleDropdown = () => setShowDropdown(prev => !prev);
  const toggleLogoutModal = () => setShowLogoutModal(prev => !prev);

  return (
    <>
      <div className="sidebar">
        {/* --- Sidebar Icons --- */}
        <div className="icon-container">
          <a href="/home" className="nav-item">
            <img
              src="/Images/Home.svg"
              alt="Home"
              className="icon-img"
              width="30"
              height="30"
            />
          </a>
          <span className="sidebar_tooltip">Home</span>
        </div>

        <div className="icon-container">
          <a href="/notifications" className="nav-item">
            <img
              src="/Images/Notifications.svg"
              alt="Notifications"
              className="icon-img"
              width="30"
              height="30"
            />
          </a>
          <span className="sidebar_tooltip">Notifications</span>
        </div>

        <div className="icon-container">
          <a href="/create_post" className="nav-item">
            <img
              src="/Images/Create.svg"
              alt="Create"
              className="icon-img"
              width="30"
              height="30"
            />
          </a>
          <span className="sidebar_tooltip">Create</span>
        </div>

        <div className="icon-container">
          <a href="/chat" className="nav-item">
            <img
              src="/Images/Chat.svg"
              alt="Chat"
              className="icon-img"
              width="30"
              height="30"
            />
          </a>
          <span className="sidebar_tooltip">Chat</span>
        </div>

        <div className="icon-container">
          <a href="/connect" className="nav-item">
            <img
              src="/Images/Connect.svg"
              alt="Connect"
              className="icon-img"
              width="30"
              height="30"
            />
          </a>
          <span className="sidebar_tooltip">Connect</span>
        </div>

        <div className="icon-container">
          <a href="/stories" className="nav-item">
            <img
              src="/Images/Stories.svg"
              alt="Stories"
              className="icon-img"
              width="30"
              height="30"
            />
          </a>
          <span className="sidebar_tooltip">Stories</span>
        </div>

        <div className="icon-container">
          <a href="/reels" className="nav-item">
            <img
              src="/Images/Reels.svg"
              alt="Reels"
              className="icon-img"
              width="30"
              height="30"
            />
          </a>
          <span className="sidebar_tooltip">Reels</span>
        </div>

        <div className="icon-container">
          <a href="/games" className="nav-item">
            <img
              src="/Images/Game.svg"
              alt="Game"
              className="icon-img"
              width="30"
              height="30"
            />
          </a>
          <span className="sidebar_tooltip">Game</span>
        </div>

        <div className="icon-container">
          <a href="/payment" className="nav-item">
            <img
              src="/Images/Premium.svg"
              alt="Premium"
              className="icon-img"
              width="30"
              height="30"
            />
          </a>
          <span className="sidebar_tooltip">Premium</span>
        </div>

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

        <div className="profile">
          <a href="/profile" className="nav-item profile-pic-anchor">
            <img
              src="/Images/default_user.jpeg"
              alt="Profile"
              className="sidebar-profile-pic"
            />
          </a>
        </div>

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

      {showLogoutModal && (
        <div
          className="modal-overlay active"
          onClick={e => {
            if (e.target === e.currentTarget) toggleLogoutModal();
          }}
        >
          <div className="logout-modal">
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to log out from your account?</p>
            <div className="buttons">
              <button
                className="logout-btn"
                onClick={() => console.log('Logged out')}
              >
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
