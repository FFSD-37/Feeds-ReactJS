import React, { useState } from "react";
import "../styles/profilePage.css";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [overlayType, setOverlayType] = useState(null);
  const [menuData, setMenuData] = useState(null);

  const [myUser] = useState({
    display_name: "John Doe",
    username: "johndoe",
    profilePicture:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
    isPremium: true,
    bio: "Adventure seeker | Coffee lover ☕ | Photography enthusiast 📸",
    postIds: [1, 2, 3, 4, 5, 6],
    followers: [
      { username: "alice_wonder" },
      { username: "bob_builder" },
      { username: "charlie_brown" },
    ],
    followings: [{ username: "design_master" }, { username: "tech_guru" }],
  });

  const [posts] = useState([
    {
      id: "1",
      type: "Img",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    },
    {
      id: "2",
      type: "Img",
      url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
    },
    {
      id: "3",
      type: "Reels",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
      id: "4",
      type: "Img",
      url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400",
    },
    {
      id: "5",
      type: "Img",
      url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400",
    },
    {
      id: "6",
      type: "Img",
      url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400",
    },
  ]);

  const [saved] = useState([
    {
      id: "7",
      type: "Img",
      url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400",
    },
    {
      id: "8",
      type: "Img",
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    },
  ]);

  const [liked] = useState([
    {
      id: "9",
      type: "Img",
      url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400",
    },
  ]);

  const [archived] = useState([
    {
      id: "10",
      type: "Img",
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400",
    },
  ]);

  const showTab = (tabId) => setActiveTab(tabId);

  const getCurrentTabPosts = () => {
    switch (activeTab) {
      case "posts":
        return posts;
      case "saved":
        return saved;
      case "liked":
        return liked;
      case "archive":
        return archived;
      default:
        return [];
    }
  };

  const openMenu = (type, id) => setMenuData({ type, id });
  const closeOverlay = () => {
    setOverlayType(null);
    setMenuData(null);
  };
  const create_post = () => alert("Redirecting to create post page...");

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <img
            src={myUser.profilePicture}
            alt="Profile"
            className="profile-picture"
          />
          <div className="profile-details">
            <h2>{myUser.display_name}</h2>
            <p>@{myUser.username}</p>
            <p className="bio">{myUser.bio}</p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="tabs">
          {["posts", "saved", "liked", "archive"].map((tab) => (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => showTab(tab)}
            >
              {tab === "posts" && "📷"}
              {tab === "saved" && "🔖"}
              {tab === "liked" && "💕"}
              {tab === "archive" && "📁"} {tab}
            </div>
          ))}
        </nav>

        {/* Grid */}
        <div className="grid">
          {getCurrentTabPosts().map((item) => (
            <div key={item.id} className="grid-item">
              {item.type === "Reels" ? (
                <video src={item.url} muted loop autoPlay />
              ) : (
                <img src={item.url} alt="Post" />
              )}
              {activeTab !== "liked" && (
                <button
                  className="menu-btn"
                  onClick={() =>
                    openMenu(
                      activeTab === "posts"
                        ? "post"
                        : activeTab === "saved"
                        ? "saved"
                        : "archived",
                      item.id
                    )
                  }
                >
                  ⋮
                </button>
              )}
            </div>
          ))}

          {activeTab === "posts" && (
            <div className="grid-item create-post" onClick={create_post}>
              <span className="plus">+</span>
              <strong>Create New Post</strong>
            </div>
          )}

          {getCurrentTabPosts().length === 0 && (
            <div className="empty-message">No {activeTab} yet.</div>
          )}
        </div>
      </div>

      {(overlayType || menuData) && (
        <div className="overlay" onClick={closeOverlay}></div>
      )}
    </div>
  );
}
