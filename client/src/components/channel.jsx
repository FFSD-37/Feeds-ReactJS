import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'react-icons/fa';
import './../styles/channel.css';
import { useUserData } from './../providers/userData.jsx';
import usePostOverlay from '../hooks/usePostOverlay.jsx';

function ChannelPage() {
  const { channelName } = useParams();
  const { userData } = useUserData();
  const navigate = useNavigate();
  const { openPostOverlay, overlay } = usePostOverlay();

  const [channelData, setChannelData] = useState(null);
  const [postsData, setPostsData] = useState({
    posts: [],
    archived: [],
    liked: [],
    saved: [],
  });
  const [activeTab, setActiveTab] = useState('posts');
  const [showOptions, setShowOptions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const isViewerUser = userData?.type === 'Normal' || userData?.type === 'Kids';
  const isMyChannel =
    userData?.type === 'Channel' &&
    userData?.channelName === channelData?.channel_name;

  const optionsRef = useRef();
  const membersRef = useRef();

  const categoryIcons = {
    All: <FaGlobe color="#9e9e9e" />,
    Education: <FaBook color="#3f51b5" />,
    Animations: <FaFilm color="#ff9800" />,
    Games: <FaGamepad color="#00ff99" />,
    Memes: <FaLaugh color="#ff4081" />,
    News: <FaNewspaper color="#00bcd4" />,
    Tech: <FaLaptopCode color="#8e24aa" />,
    Vlog: <FaVideo color="#ff5722" />,
    Entertainment: <FaTv color="#ffd740" />,
    Sports: <FaFutbol color="#4caf50" />,
    Nature: <FaLeaf color="#43a047" />,
    Music: <FaMusic color="#00b0ff" />,
    Marketing: <FaBullhorn color="#cddc39" />,
    Fitness: <FaDumbbell color="#f44336" />,
    Lifestyle: <FaHeart color="#e91e63" />,
  };

  useEffect(() => {
    if (!userData?.username && !userData?.channelName) return;
    const fetchChannelData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/getchannel/${channelName}`,
          {
            credentials: 'include',
          },
        );

        if (res.status === 404) {
          setErrorMsg('Channel not found');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch channel');

        const data = await res.json();
        setChannelData(data);
        setIsFollowing(
          data?.channel_members?.some(m => m.username === userData.username),
        );

        const fetchPosts = async ids => {
          if (!ids?.length) return [];
          const query = new URLSearchParams({ postIds: ids.join(',') });
          const res = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/getchannelposts?${query.toString()}`,
            { credentials: 'include' },
          );
          return res.ok ? await res.json() : [];
        };

        const [posts, archived, liked, saved] = await Promise.all([
          fetchPosts(data.channel_posts),
          fetchPosts(data.channel_archived),
          fetchPosts(data.channel_liked),
          fetchPosts(data.channel_saved),
        ]);

        setPostsData({ posts, archived, liked, saved });
      } catch (err) {
        console.error('❌ Channel fetch failed:', err);
        setErrorMsg('Error loading channel');
      }
    };
    fetchChannelData();

    const handleClickOutside = e => {
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        setShowOptions(false);
      if (membersRef.current && !membersRef.current.contains(e.target))
        setShowMembers(false);
    };

    const handleEscape = e => {
      if (e.key === 'Escape') {
        setShowOptions(false);
        setShowMembers(false);
        setShowAbout(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [channelName, userData]);

  const handleFollow = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/follow_channel/${channelData.channel_name}`,
      { method: 'POST', credentials: 'include' },
    );
    const data = await res.json();
    if (res.ok) {
      setIsFollowing(true);
      setChannelData(prev => ({
        ...prev,
        channel_members: [
          ...(prev.channel_members || []),
          { username: userData.username, profilePic: userData.profilePicture },
        ],
      }));
      alert(data.message || 'Followed!');
    } else {
      alert('Failed to follow');
    }
  };

  const handleUnfollow = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/unfollow_channel/${channelData.channel_name}`,
      { method: 'POST', credentials: 'include' },
    );
    const data = await res.json();
    if (res.ok) {
      setIsFollowing(false);
      setChannelData(prev => ({
        ...prev,
        channel_members: prev.channel_members.filter(
          m => m.username !== userData.username,
        ),
      }));
      alert(data.message || 'Unfollowed!');
    } else {
      alert('Failed to unfollow');
    }
  };

  const handleReport = async () => {
    await fetch(
      `${import.meta.env.VITE_SERVER_URL}/report_channel/${channelData.channel_name}`,
      { method: 'POST', credentials: 'include' },
    );
    alert('Reported this channel');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Channel link copied!');
  };

  const handleShare = () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: channelData.channel_name,
        text: 'Check out this channel!',
        url: shareUrl,
      });
    } else {
      alert('Sharing not supported on this device.');
    }
  };

  const renderGrid = posts =>
    posts && posts.length > 0 ? (
      posts.map((post, i) => (
        <div
          className="channel-post"
          key={i}
          onClick={() => openPostOverlay(post.id || post._id)}
        >
          {post.type === 'Img' ? (
            <img src={post.url} alt="Post" className="channel-post-img" />
          ) : (
            <video
              src={post.url}
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

  if (errorMsg) return <div className="channel-loading">{errorMsg}</div>;
  if (!channelData) return <div className="channel-loading">Loading...</div>;

  return (
    <div className="channel-page-container">
      {/* === HEADER === */}
      <header className="channel-header">
        <img
          src={channelData.channel_logo || './../../Images/default_user.jpeg'}
          alt="Logo"
          className="channel-logo"
        />

        {/* === TOP BUTTONS === */}
        <div className="channel-top-actions">
          {!isMyChannel &&
            isViewerUser &&
            channelData &&
            (isFollowing === null ? (
              <button disabled className="channel-follow-btn">
                ...
              </button>
            ) : !isFollowing ? (
              <button className="channel-follow-btn" onClick={handleFollow}>
                Follow
              </button>
            ) : (
              <button className="channel-unfollow-btn" onClick={handleUnfollow}>
                Unfollow
              </button>
            ))}

          <button
            className="channel-options-btn"
            onClick={() => setShowOptions(true)}
          >
            ⋮
          </button>
          {isMyChannel && (
            <button
              className="channel-edit-btn"
              onClick={() => navigate('/edit_channel')}
            >
              Edit Channel
            </button>
          )}
        </div>

        <div className="channel-info">
          <h1 className="channel-name">
            {channelData.channel_name}
            <span className="channel-categories-inline">
              {channelData.channel_category?.map((cat, idx) => (
                <span
                  key={idx}
                  className="channel-category-icon"
                  data-name={cat}
                >
                  {categoryIcons[cat] || cat}
                </span>
              ))}
            </span>
          </h1>

          <p className="channel-description">
            {channelData.channel_description}
          </p>

          <div className="channel-links-section">
            {channelData.channel_links.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="channel-link-pill"
              >
                {link}
              </a>
            ))}
          </div>

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
              <FaUsers /> {channelData.channel_members?.length || 0} Members
            </div>
          </div>
        </div>
      </header>

      {/* === NAVIGATION === */}
      <nav className="channel-posts-nav">
        <div
          className={`channel-nav-item ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📷 Posts
        </div>

        {isMyChannel && (
          <>
            <div
              className={`channel-nav-item ${activeTab === 'liked' ? 'active' : ''}`}
              onClick={() => setActiveTab('liked')}
            >
              ❤️ Liked
            </div>
            <div
              className={`channel-nav-item ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              💾 Saved
            </div>
            <div
              className={`channel-nav-item ${activeTab === 'archive' ? 'active' : ''}`}
              onClick={() => setActiveTab('archive')}
            >
              📁 Archived
            </div>
          </>
        )}
      </nav>

      {/* === POSTS GRID === */}
      <div className="channel-posts-grid">
        {activeTab === 'posts' && renderGrid(postsData.posts)}
        {activeTab === 'liked' && renderGrid(postsData.liked)}
        {activeTab === 'saved' && renderGrid(postsData.saved)}
        {activeTab === 'archive' && renderGrid(postsData.archived)}
      </div>

      {/* === MODALS === */}
      {showOptions && (
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
              {!isMyChannel && <li onClick={handleReport}>Report Channel</li>}

              <li onClick={handleCopyLink}>Copy Channel Link</li>
              <li onClick={handleShare}>Share Channel</li>

              <li onClick={() => setShowAbout(true)}>About</li>
              <li onClick={() => setShowOptions(false)}>Cancel</li>
            </ul>
          </div>
        </div>
      )}

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
                        'https://cdn-icons-png.flaticon.com/512/149/149071.png'
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

      {showAbout && (
        <div
          className="channel-modal-overlay"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="channel-modal about-modal"
            onClick={e => e.stopPropagation()}
          >
            <span className="channel-close" onClick={() => setShowAbout(false)}>
              ×
            </span>
            <h2 className="channel-modal-title">
              About {channelData.channel_name}
            </h2>
            <div className="channel-about-content">
              <img
                src={channelData.channel_logo}
                alt="Channel Logo"
                className="channel-about-logo"
              />
              <p className="channel-about-desc">
                {channelData.channel_description}
              </p>
              <div className="channel-about-section">
                <strong>Admin:</strong>{' '}
                <div
                  className="channel-admin-info"
                  onClick={() =>
                    navigate(`/profile/${channelData.channel_admin}`)
                  }
                >
                  <img
                    src={
                      channelData.channel_admin_pic ||
                      'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                    }
                    alt="Admin"
                    className="channel-admin-pic"
                  />
                  <span>{channelData.channel_admin}</span>
                </div>
              </div>
              <div className="channel-about-section">
                <strong>Category:</strong>{' '}
                {channelData.channel_category?.join(', ') || 'Uncategorized'}
              </div>
              <div className="channel-about-section">
                <strong>Members:</strong>{' '}
                {channelData.channel_members?.length || 0}
              </div>
              <div className="channel-about-section">
                <strong>Created On:</strong>{' '}
                {new Date(channelData.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {overlay}
    </div>
  );
}

export default ChannelPage;
