import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from './../providers/userData.jsx';
import './../styles/connect.css';
import {
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

const Connect = () => {
  const { userData } = useUserData();
  const navigate = useNavigate();

  const [initialized, setInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState(null);
  const [filter, setFilter] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const categories = Object.keys(categoryIcons);

  // 🔹 Initialize mode after userData is ready
  useEffect(() => {
    if (userData && userData.type) {
      setMode(userData.type === 'Normal' ? 'users' : 'channels');
      setInitialized(true);
    }
  }, [userData]);

  // 🔹 Fetch connections or followed channels based on mode/type
  useEffect(() => {
    if (!initialized || !mode) return;

    const fetchConnect = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/connect?mode=${mode}`,
          {
            credentials: 'include',
          },
        );
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setItems(data.items || []);
      } catch (err) {
        console.error('❌ Fetch connect failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnect();
  }, [mode, initialized, userData?.type]);

  // 🔹 Search & Filter
  useEffect(() => {
    if (!initialized || !mode) return;

    const delay = setTimeout(async () => {
      if (searchTerm.trim() === '') return;

      try {
        const params = new URLSearchParams({
          query: searchTerm,
          type: mode === 'channels' ? 'channel' : 'user',
          category: filter,
        });

        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/connect/search?${params.toString()}`,
          { credentials: 'include' },
        );
        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        console.error('❌ Search failed:', err);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm, filter, mode, initialized]);

  // 🔹 Follow / Unfollow / Requested logic
  const handleFollowToggle = async (
    target,
    targetType,
    currentState,
    visibility,
  ) => {
    try {
      const isFollowing = currentState === 'following' || currentState === true;
      const endpoint = isFollowing
        ? `${import.meta.env.VITE_SERVER_URL}/connect/unfollow`
        : `${import.meta.env.VITE_SERVER_URL}/connect/follow`;

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, targetType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setItems(prev =>
        prev.map(i => {
          if (i.username === target || i.name === target) {
            const updated = { ...i };
            switch (data.status) {
              case 'requested':
                updated.requested = true;
                updated.isFollowing = false;
                break;
              case 'request_canceled':
                updated.requested = false;
                updated.isFollowing = false;
                break;
              case 'following':
              case 'friend':
                updated.isFollowing = true;
                updated.requested = false;
                break;
              case 'unfollowed':
                updated.isFollowing = false;
                updated.requested = false;
                break;
              default:
                break;
            }
            return updated;
          }
          return i;
        }),
      );
    } catch (err) {
      console.error('❌ Follow toggle failed:', err);
    }
  };

  const getButtonLabel = item =>
    item.requested
      ? 'Requested'
      : item.isFollowing
        ? 'Following'
        : item.friend
          ? 'Friend'
          : 'Follow';

  const getButtonClass = item =>
    item.requested
      ? 'connect-btn-requested'
      : item.isFollowing
        ? 'connect-btn-following'
        : item.friend
          ? 'connect-btn-friend'
          : 'connect-btn-default';

  if (!initialized)
    return (
      <div className="connect-loading">
        <p>Loading...</p>
      </div>
    );

  // 🔹 Navigate to profile or channel
  const handleCardClick = item => {
    if (item.type === 'Channel') navigate(`/channel/${item.name}`);
    else navigate(`/profile/${item.username}`);
  };

  return (
    <div className="connect-body">
      <div className="connect-container">
        <div className="connect-header">
          <h1 className="connect-title">
            {userData?.type === 'Normal'
              ? mode === 'users'
                ? '👥 Connect with People'
                : '📺 Discover Channels'
              : '📺 Channels You Follow'}
          </h1>
          {userData?.type === 'Normal' && (
            <div className="connect-toggle">
              <button
                className={`connect-toggle-btn ${mode === 'users' ? 'active' : ''}`}
                onClick={() => setMode('users')}
              >
                People
              </button>
              <button
                className={`connect-toggle-btn ${mode === 'channels' ? 'active' : ''}`}
                onClick={() => setMode('channels')}
              >
                Channels
              </button>
            </div>
          )}
        </div>

        {/* SEARCH & FILTER */}
        <div className="connect-searchbar">
          <input
            type="text"
            className="connect-search-input"
            placeholder={
              mode === 'channels'
                ? 'Search by channel name...'
                : 'Search by username or name...'
            }
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {mode === 'channels' && (
            <select
              className="connect-filter"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* RESULTS */}
        <div className={`connect-results ${loading ? '' : 'connect-fade show'}`}>
          {loading ? (
            <div className="connect-loading">Loading...</div>
          ) : items.length === 0 ? (
            <div className="connect-empty">No results found</div>
          ) : (
            <ul className="connect-list">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="connect-item"
                  onClick={() => handleCardClick(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="connect-left">
                    <img
                      src={item.avatarUrl || item.logo}
                      alt={item.username || item.name}
                      className="connect-avatar"
                    />
                    <div className="connect-info">
                      <div className="connect-name">
                        {item.display_name || item.name}
                        {item.category && (
                          <span className="connect-category-icon">
                            {categoryIcons[item.category[0]]}
                          </span>
                        )}
                      </div>
                      <div className="connect-username">
                        @{item.username || item.name}
                      </div>
                      <div className="connect-stats">
                        {item.type === 'Channel' ? (
                          <span>{item.members} Members</span>
                        ) : (
                          <>
                            <span>{item.followers || 0} Followers</span>
                            <span>{item.following || 0} Following</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {(userData?.type === 'Normal' || userData?.type === 'Kids') && (
                    <button
                      className={`connect-follow-btn ${getButtonClass(item)}`}
                      onClick={e => {
                        e.stopPropagation();
                        handleFollowToggle(
                          item.username || item.name,
                          item.type,
                          item.isFollowing
                            ? 'following'
                            : item.requested
                              ? 'requested'
                              : 'none',
                          item.visibility,
                        );
                      }}
                    >
                      {getButtonLabel(item)}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connect;
