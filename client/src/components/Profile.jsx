import React, { useEffect, useState } from 'react';
import { User, Settings, Grid, Heart, Bookmark, Archive } from 'lucide-react';
import { UserDataProvider, useUserData } from '../providers/userData.jsx';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const { userData } = useUserData();
  const ProfileUsername = useParams();
  const { email, isPremium, profileUrl, type, username } = userData;

  const fetchAll = async (username) => {
    // console.log(username);
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/profile/${username}`,
      {
        method: 'GET',
        credentials: 'include',
      },
    );
    const data = await res.json();
    console.log(data);
  };

  useEffect(() => {
    if(ProfileUsername.username) fetchAll(ProfileUsername.username);
  }, [ProfileUsername.username]);

  const posts = [
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      likes: 234,
      comments: 12,
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400',
      likes: 189,
      comments: 18,
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
      likes: 456,
      comments: 23,
    },
    {
      id: 4,
      image:
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
      likes: 321,
      comments: 15,
    },
    {
      id: 5,
      image:
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
      likes: 278,
      comments: 19,
    },
    {
      id: 6,
      image:
        'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400',
      likes: 412,
      comments: 27,
    },
  ];

  const liked = [
    {
      id: 7,
      image:
        'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400',
      likes: 567,
      comments: 34,
    },
    {
      id: 8,
      image:
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
      likes: 445,
      comments: 21,
    },
    {
      id: 9,
      image:
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400',
      likes: 389,
      comments: 18,
    },
  ];

  const saved = [
    {
      id: 10,
      image:
        'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400',
      likes: 512,
      comments: 29,
    },
    {
      id: 11,
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      likes: 678,
      comments: 42,
    },
  ];

  const archived = [
    {
      id: 12,
      image:
        'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400',
      likes: 234,
      comments: 11,
    },
  ];

  const getContent = () => {
    switch (activeTab) {
      case 'posts':
        return posts;
      case 'liked':
        return liked;
      case 'saved':
        return saved;
      case 'archived':
        return archived;
      default:
        return posts;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.profileCard}>
        {/* Header with Settings */}
        <div style={styles.header}>
          <h2 style={styles.username}>@{username}</h2>
          <button style={styles.settingsBtn}>
            <Settings size={20} />
          </button>
        </div>

        {/* Profile Info */}
        <div style={styles.profileInfo}>
          <div style={styles.avatarContainer}>
            <img src={profileUrl} style={styles.avatar} />
          </div>

          <div style={styles.stats}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>342</div>
              <div style={styles.statLabel}>Posts</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>12.5K</div>
              <div style={styles.statLabel}>Followers</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>1,234</div>
              <div style={styles.statLabel}>Following</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div style={styles.bio}>
          <h3 style={styles.displayName}>Alex Johnson</h3>
          <p style={styles.bioText}>
            📸 Travel & Nature Photographer
            <br />
            🌍 Exploring the world one shot at a time
            <br />
            ✉️ alex@photography.com
          </p>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button style={styles.editBtn}>Edit Profile</button>
          <button style={styles.shareBtn}>Share Profile</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'posts' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('posts')}
          >
            <Grid size={20} />
            <span style={styles.tabLabel}>Posts</span>
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'liked' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('liked')}
          >
            <Heart size={20} />
            <span style={styles.tabLabel}>Liked</span>
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'saved' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('saved')}
          >
            <Bookmark size={20} />
            <span style={styles.tabLabel}>Saved</span>
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'archived' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('archived')}
          >
            <Archive size={20} />
            <span style={styles.tabLabel}>Archived</span>
          </button>
        </div>

        {/* Content Grid */}
        <div style={styles.grid}>
          {getContent().map(post => (
            <div key={post.id} style={styles.gridItem}>
              <img src={post.image} alt="Post" style={styles.gridImage} />
              <div style={styles.overlay}>
                <span style={styles.overlayText}>
                  <Heart size={18} fill="#fff" /> {post.likes}
                </span>
                <span style={styles.overlayText}>💬 {post.comments}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    padding: '20px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  profileCard: {
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 10px',
  },
  username: {
    fontSize: '24px',
    fontWeight: '300',
    margin: 0,
    color: '#262626',
  },
  settingsBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  profileInfo: {
    display: 'flex',
    padding: '20px',
    gap: '40px',
  },
  avatarContainer: {
    flex: '0 0 auto',
  },
  avatar: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid black',
  },
  stats: {
    flex: 1,
    display: 'flex',
    gap: '40px',
    alignItems: 'center',
  },
  statItem: {
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#262626',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '16px',
    color: '#8e8e8e',
  },
  bio: {
    padding: '0 20px 20px',
  },
  displayName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#262626',
    marginBottom: '8px',
  },
  bioText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#262626',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '10px',
    padding: '0 20px 20px',
  },
  editBtn: {
    flex: 1,
    padding: '10px 20px',
    backgroundColor: '#0095f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  shareBtn: {
    flex: 1,
    padding: '10px 20px',
    backgroundColor: '#fff',
    color: '#262626',
    border: '1px solid #dbdbdb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabs: {
    display: 'flex',
    borderTop: '1px solid #dbdbdb',
    borderBottom: '1px solid #dbdbdb',
    marginTop: '20px',
  },
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px',
    background: 'none',
    border: 'none',
    borderTop: '2px solid transparent',
    cursor: 'pointer',
    color: '#8e8e8e',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    marginTop: '-1px',
  },
  activeTab: {
    color: '#262626',
    borderTopColor: '#262626',
  },
  tabLabel: {
    display: 'inline',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4px',
    padding: '4px',
  },
  gridItem: {
    position: 'relative',
    paddingBottom: '100%',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  gridImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  overlayText: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
};

// Add hover effect via CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  [style*="gridItem"]:hover [style*="overlay"] {
    opacity: 1 !important;
  }
  button:hover {
    opacity: 0.9;
  }
  [style*="settingsBtn"]:hover {
    background-color: #f0f0f0;
  }
`;
document.head.appendChild(styleSheet);

export default ProfilePage;
