import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaUsers,
  FaGlobe,
  FaBook,
  FaFilm,
  FaGamepad,
  FaLaugh,
  FaNewspaper,
  FaLaptopCode,
  FaVideo,
  FaTv,
  FaFutbol,
  FaLeaf,
  FaMusic,
  FaBullhorn,
  FaDumbbell,
  FaHeart,
} from "react-icons/fa";
import "./../styles/channel.css";
import { useUserData } from "./../providers/userData.jsx";

function ChannelPage() {
  const { channelName } = useParams();
  const { userData } = useUserData();
  const navigate = useNavigate();

  const [channelData, setChannelData] = useState(null);
  const [channelPosts, setChannelPosts] = useState([]);
  const [channelArchivedPosts, setChannelArchivedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showOptions, setShowOptions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const optionsRef = useRef();
  const membersRef = useRef();

  const isMyChannel =
    userData?.type === "Channel" &&
    userData?.channelName === channelData?.channel_name;

  // category icons
  const categoryIcons = {
    All: <FaGlobe color="#9e9e9e" title="All" />,
    Education: <FaBook color="#3f51b5" title="Education" />,
    Animations: <FaFilm color="#ff9800" title="Animations" />,
    Games: <FaGamepad color="#00ff99" title="Games" />,
    Memes: <FaLaugh color="#ff4081" title="Memes" />,
    News: <FaNewspaper color="#00bcd4" title="News" />,
    Tech: <FaLaptopCode color="#8e24aa" title="Tech" />,
    Vlog: <FaVideo color="#ff5722" title="Vlog" />,
    Entertainment: <FaTv color="#ffd740" title="Entertainment" />,
    Sports: <FaFutbol color="#4caf50" title="Sports" />,
    Nature: <FaLeaf color="#43a047" title="Nature" />,
    Music: <FaMusic color="#00b0ff" title="Music" />,
    Marketing: <FaBullhorn color="#cddc39" title="Marketing" />,
    Fitness: <FaDumbbell color="#f44336" title="Fitness" />,
    Lifestyle: <FaHeart color="#e91e63" title="Lifestyle" />,
  };

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/getchannel/${channelName}`,
          { method: "GET", credentials: "include" }
        );
        if (!res.ok) return console.error("Failed:", res.status);

        const data = await res.json();
        setChannelData(data);

        if (Array.isArray(data.channel_posts) && data.channel_posts.length > 0) {
          const query = new URLSearchParams({ postIds: data.channel_posts.join(",") });
          const postsRes = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/getchannelposts?${query.toString()}`,
            { method: "GET", credentials: "include" }
          );
          setChannelPosts(await postsRes.json());
        }

        if (Array.isArray(data.channel_archived) && data.channel_archived.length > 0) {
          const query = new URLSearchParams({ postIds: data.channel_archived.join(",") });
          const archivedRes = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/getchannelposts?${query.toString()}`,
            { method: "GET", credentials: "include" }
          );
          setChannelArchivedPosts(await archivedRes.json());
        }

      } catch (error) {
        console.error("Error fetching channel:", error);
      }
    };
    fetchChannelData();

    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target))
        setShowOptions(false);
      if (membersRef.current && !membersRef.current.contains(event.target))
        setShowMembers(false);
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowOptions(false);
        setShowMembers(false);
        setShowAbout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [channelName]);

  const handleFollow = async () => {
    await fetch(
      `${import.meta.env.VITE_SERVER_URL}/follow_channel/${channelData.channel_name}`,
      { method: "POST", credentials: "include" }
    );
    alert("Followed channel!");
  };

  const handleUnfollow = async () => {
    await fetch(
      `${import.meta.env.VITE_SERVER_URL}/unfollow_channel/${channelData.channel_name}`,
      { method: "POST", credentials: "include" }
    );
    alert("Unfollowed channel!");
  };

  const handleReport = async () => {
    await fetch(
      `${import.meta.env.VITE_SERVER_URL}/report_channel/${channelData.channel_name}`,
      { method: "POST", credentials: "include" }
    );
    alert("Reported this channel");
  };

  const handleBlock = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/block_channel/${channelData.channel_name}`,
      { method: "POST", credentials: "include" }
    );
    const data = await res.json();
    alert(data.flag === "blocked" ? "Channel blocked" : "Channel unblocked");
    window.location.href = "/";
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Channel link copied!");
  };

  const renderGrid = (posts) =>
    posts && posts.length > 0 ? (
      posts.map((post, i) => (
        <div className="channel-post" key={i}>
          {post.type === "Img" ? (
            <img src={post.url} alt="Post" className="channel-post-img" />
          ) : (
            <video
              src={post.url}
              autoPlay
              controls
              muted
              loop
              playsInline
              className="channel-post-video"
            />
          )}
        </div>
      ))
    ) : (
      <div className="channel-no-posts-msg">No posts yet.</div>
    );

  if (!channelData) return <div className="channel-loading">Loading...</div>;

  return (
    <div className="channel-page-container">
      {/* === HEADER === */}
      <header className="channel-header">
        <img
          src={channelData.channel_logo}
          alt="Channel Logo"
          className="channel-logo"
        />

        <div className="channel-info">
          <h1 className="channel-name">
            {channelData.channel_name}
            <span className="channel-categories-inline">
              {channelData.channel_category?.map((cat, idx) => (
                <span key={idx} className="channel-category-icon">
                  {categoryIcons[cat] || cat}
                </span>
              ))}
            </span>
          </h1>

          <p className="channel-description">
            {channelData.channel_description}
          </p>

          <div className="channel-admin-section">
            <div
              className="channel-admin"
              onClick={() => navigate(`/profile/${channelData.channel_admin}`)}
            >
              {channelData.channel_admin_pic ? (
                <img
                  src={channelData.channel_admin_pic}
                  alt={channelData.channel_admin}
                />
              ) : (
                <FaUser />
              )}
              <span>{channelData.channel_admin}</span>
            </div>

            <div
              className="channel-members"
              onClick={() => setShowMembers(true)}
            >
              <FaUsers />{" "}
              <span>{channelData.channel_members?.length || 0} Members</span>
            </div>
          </div>

          {isMyChannel ? (
            <div className="channel-info-header">
              <button
                className="channel-edit-btn"
                onClick={() =>
                  navigate(`/edit_channel/${channelData.channel_name}`)
                }
              >
                Edit Channel
              </button>
            </div>
          ) : (
            <div className="channel-info-header">
              <button className="channel-follow-btn" onClick={handleFollow}>
                Follow
              </button>
              <button
                className="channel-options-btn"
                onClick={() => setShowOptions(true)}
              >
                ⋮
              </button>
            </div>
          )}
        </div>
      </header>

      {/* === NAV === */}
      <nav className="channel-posts-nav">
        <div
          className={`channel-nav-item ${
            activeTab === "posts" ? "active" : ""
          }`}
          onClick={() => setActiveTab("posts")}
        >
          📷 Posts
        </div>
        {isMyChannel && (
          <div
            className={`channel-nav-item ${
              activeTab === "archive" ? "active" : ""
            }`}
            onClick={() => setActiveTab("archive")}
          >
            📁 Archived
          </div>
        )}
      </nav>

      {/* === POSTS GRID === */}
      <div className="channel-posts-grid">
        {activeTab === "posts"
          ? renderGrid(channelPosts)
          : renderGrid(channelArchivedPosts)}
      </div>

      {/* === FOOTER === */}
      <footer className="channel-footer">
        <a href="/contact">About</a> • <a href="/help">Help</a> •{" "}
        <a href="/tandc">Terms</a> •{" "}
        <a
          href="https://www.google.com/maps/place/Indian+Institute+of+Information+Technology,+Sri+City,+Chittoor/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Locations
        </a>
        <p>
          © 2025{" "}
          <a href="/home" style={{ color: "#00bcd4" }}>
            Feeds
          </a>{" "}
          from IIIT Sri-City
        </p>
      </footer>

      {/* === OPTIONS OVERLAY === */}
      {showOptions && !isMyChannel && (
        <div className="channel-modal-overlay">
          <div className="channel-modal" ref={optionsRef}>
            <span
              className="channel-close"
              onClick={() => setShowOptions(false)}
            >
              ×
            </span>
            <h2 className="channel-modal-title">Options</h2>
            <ul className="channel-modal-list">
              <li onClick={handleReport}>Report Channel</li>
              <li onClick={handleBlock}>Block / Unblock Channel</li>
              <li onClick={handleShare}>Copy Channel Link</li>
              <li onClick={() => setShowAbout(true)}>About</li>
              <li onClick={() => setShowOptions(false)}>Cancel</li>
            </ul>
          </div>
        </div>
      )}

      {/* === MEMBERS OVERLAY === */}
      {showMembers && (
        <div className="channel-modal-overlay">
          <div className="channel-modal" ref={membersRef}>
            <span
              className="channel-close"
              onClick={() => setShowMembers(false)}
            >
              ×
            </span>
            <h2 className="channel-modal-title">Members</h2>
            <ul className="channel-member-list">
              {channelData.channel_members?.length > 0 ? (
                channelData.channel_members.map((m, i) => (
                  <li
                    key={i}
                    className="channel-member-item"
                    onClick={() => navigate(`/profile/${m.username}`)}
                  >
                    <img
                      src={
                        m.profilePic ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={m.username}
                      className="channel-member-pic"
                    />
                    <span>{m.username}</span>
                  </li>
                ))
              ) : (
                <li>No members yet.</li>
              )}
            </ul>
          </div>
        </div>
      )}
      {/* === ABOUT OVERLAY === */}
      {showAbout && (
        <div className="channel-modal-overlay" onClick={() => setShowAbout(false)}>
          <div
            className="channel-modal about-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="channel-close"
              onClick={() => setShowAbout(false)}
            >
              ×
            </span>

            <h2 className="channel-modal-title">About {channelData.channel_name}</h2>

            <div className="channel-about-content">
              <img
                src={channelData.channel_logo}
                alt="Channel Logo"
                className="channel-about-logo"
              />

              <p className="channel-about-desc">{channelData.channel_description}</p>

              <div className="channel-about-section">
                <strong>Admin:</strong>
                <div
                  className="channel-admin-info"
                  onClick={() => navigate(`/profile/${channelData.channel_admin}`)}
                >
                  {channelData.channel_admin_pic ? (
                    <img
                      src={channelData.channel_admin_pic}
                      alt={channelData.channel_admin}
                      className="channel-admin-pic"
                    />
                  ) : (
                    <FaUser />
                  )}
                  <span>{channelData.channel_admin}</span>
                </div>
              </div>

              <div className="channel-about-section">
                <strong>Category:</strong>{" "}
                {channelData.channel_category?.join(", ") || "Uncategorized"}
              </div>

              <div className="channel-about-section">
                <strong>Members:</strong> {channelData.channel_members?.length || 0}
              </div>

              <div className="channel-about-section">
                <strong>Created On:</strong>{" "}
                {new Date(channelData.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ChannelPage;
