import React, { useState } from "react";
import { FaUser, FaUsers, FaGamepad, FaFilm, FaMusic, FaTv } from "react-icons/fa";
import "./../styles/channel.css";

function ChannelPage() {
  const [channel_data] = useState({
    channel_name: "DarkLord",
    channel_description: "Let's game together and share epic moments!",
    channel_logo: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    channel_admin: "ayush",
    channel_category: ["Games", "Movies"],
    channel_members: [
      { id: 1, username: "player1", profilePic: "https://cdn-icons-png.flaticon.com/512/149/149071.png" },
      { id: 2, username: "player2", profilePic: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png" },
      { id: 3, username: "gamerQueen", profilePic: "https://cdn-icons-png.flaticon.com/512/219/219970.png" },
    ],
    channel_posts: [
      { id: 1, type: "Img", url: "https://placekitten.com/600/400" },
      { id: 2, type: "Img", url: "https://picsum.photos/600/400?random=1" },
      { id: 3, type: "Img", url: "https://picsum.photos/600/400?random=2" },
      { id: 4, type: "Img", url: "https://picsum.photos/600/400?random=3" },
      { id: 5, type: "Reels", url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4" },
    ],
    channel_archived: [
      { id: 6, type: "Img", url: "https://picsum.photos/600/400?random=4" },
      { id: 7, type: "Img", url: "https://picsum.photos/600/400?random=5" },
    ],
  });

  const [channel_tab, setChannelTab] = useState("posts");
  const [channel_show_members, setChannelShowMembers] = useState(false);

  const categoryIcons = {
    Games: <FaGamepad color="#00ff99" title="Games" />,
    Movies: <FaFilm color="#ff4081" title="Movies" />,
    Music: <FaMusic color="#00b0ff" title="Music" />,
    Entertainment: <FaTv color="#ffd740" title="Entertainment" />,
  };

  const currentPosts =
    channel_tab === "posts"
      ? channel_data.channel_posts
      : channel_data.channel_archived;

  return (
    <div className="channel-container">
      {/* HEADER */}
      <div className="channel-header">
        <img src={channel_data.channel_logo} alt="logo" className="channel-logo" />
        <div className="channel-info">
          <h1 className="channel-name">
            {channel_data.channel_name}
            <span className="channel-categories-inline">
              {channel_data.channel_category.map((cat, idx) => (
                <span key={idx} className="channel-category-icon" title={cat}>
                  {categoryIcons[cat] || cat}
                </span>
              ))}
            </span>
          </h1>
          <p className="channel-description">{channel_data.channel_description}</p>
          <div className="channel-admin-section">
            <div
              className="channel-admin"
              onClick={() => alert("View Admin Profile")}
            >
              <FaUser /> <span>{channel_data.channel_admin}</span>
            </div>
            <div
              className="channel-members"
              onClick={() => setChannelShowMembers(true)}
            >
              <FaUsers />{" "}
              <span>{channel_data.channel_members.length} Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="channel-tabs">
        <button
          className={`channel-tab-btn ${
            channel_tab === "posts" ? "active" : ""
          }`}
          onClick={() => setChannelTab("posts")}
        >
          Posts
        </button>
        <button
          className={`channel-tab-btn ${
            channel_tab === "archive" ? "active" : ""
          }`}
          onClick={() => setChannelTab("archive")}
        >
          Archived
        </button>
      </div>

      {/* POSTS GRID */}
      <div className="channel-body">
        <div className="channel-posts-grid">
          {currentPosts.map((item) => (
            <div key={item.id} className="channel-post-card">
              {item.type === "Img" ? (
                <img
                  src={item.url}
                  alt="post"
                  className="channel-post-img"
                />
              ) : (
                <video
                  src={item.url}
                  controls
                  muted
                  className="channel-post-video"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MEMBERS MODAL */}
      {channel_show_members && (
        <div
          className="channel-modal-overlay"
          onClick={() => setChannelShowMembers(false)}
        >
          <div
            className="channel-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="channel-modal-title">Members</h2>
            <ul className="channel-member-list">
              {channel_data.channel_members.map((member) => (
                <li
                  key={member.id}
                  className="channel-member-item"
                  onClick={() => alert(`View ${member.username}'s profile`)}
                >
                  <img
                    src={member.profilePic}
                    alt={member.username}
                    className="channel-member-pic"
                  />
                  <span>{member.username}</span>
                </li>
              ))}
            </ul>
            <button
              className="channel-close-btn"
              onClick={() => setChannelShowMembers(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChannelPage;
