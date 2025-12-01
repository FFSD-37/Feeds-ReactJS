import React, { useEffect, useState } from 'react';
import { Settings, Tv, Heart, Bookmark } from 'lucide-react'; // 'Tv' represents Channels
import { useUserData } from '../providers/userData.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/KidsProfile.css';

const KidsProfile = () => {
  const [activeTab, setActiveTab] = useState('channels'); // Default to Channels (Posts)
  const { userData } = useUserData();
  const ProfileUsername = useParams();
  const navigate = useNavigate();
  const { username: loggedInUsername } = userData;

  // State Variables
  const [details, setDetails] = useState({
    full_name: "",
    bio: "",
    pfp: "",
    display_name: "",
    links: [],
    followers: [],
    followings: [],
    posts: [],      // Maps to "Channels"
    liked: [],      // Maps to "Liked"
    saved: []       // Maps to "Saved"
  });

  const [loading, setLoading] = useState(true);
  const [relationship, setRelationship] = useState("");
  
  // Fetch Basic Info
  const fetchBasic = async (username) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/profile/getbasic/${username}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setDetails(prev => ({ ...prev, ...data.details }));
      }
    } catch (err) {
      console.error("Basic fetch error", err);
    }
  };

  // Fetch Sensitive Info (Posts, Saved, Liked)
  const fetchSensitive = async (username) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/profile/sensitive/${username}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setDetails(prev => ({ ...prev, ...data.details }));
      }
    } catch (err) {
      console.error("Sensitive fetch error", err);
    }
  };

  // Check Friendship Status
  const isFriend = async (username) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/isfriend/${username}`, { credentials: "include" });
      const data = await res.json();
      setRelationship(data.relationship);
    } catch (err) {
      console.error("Friend check error", err);
    }
  };

  useEffect(() => {
    const targetUser = ProfileUsername.username;
    if (targetUser) {
      setLoading(true);
      Promise.all([
        fetchBasic(targetUser),
        fetchSensitive(targetUser)
      ]).then(() => setLoading(false));

      if (targetUser !== loggedInUsername) {
        isFriend(targetUser);
      }
    }
  }, [ProfileUsername.username, loggedInUsername]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: 'Check out this profile!', url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied!');
    }
  };

  // Logic to determine what content to show based on tabs
  const getContent = () => {
    switch (activeTab) {
      case 'channels': return details.posts || [];
      case 'liked': return details.liked || [];
      case 'saved': return details.saved || [];
      default: return [];
    }
  };

  // Decide if we should show content (Privacy logic)
  const canSeeContent = () => {
    if (ProfileUsername.username === loggedInUsername) return true;
    if (details.visibility === "Public") return true;
    if (relationship === "Unfollow") return true; // Means we are following them
    return false;
  };

  if (loading) return <div className="kids-profile-container">Loading...</div>;

  return (
    <div className="kids-profile-container">
      <div className="kids-profile-card">
        
        {/* --- HEADER --- */}
        <div className="kids-header">
          <div className="kids-username">{ProfileUsername.username}</div>
          {ProfileUsername.username === loggedInUsername && (
            <button className="kids-settings-btn" onClick={() => navigate("/settings")}>
              <Settings size={24} />
            </button>
          )}
        </div>

        {/* --- INFO (PFP + Stats) --- */}
        <div className="kids-info-section">
          <div className="kids-avatar-wrapper">
            <img 
              src={details.pfp || "https://via.placeholder.com/150"} 
              alt="Profile" 
              className="kids-avatar" 
            />
          </div>
          
          <div className="kids-stats">
            <div className="kids-stat-item">
              <div className="kids-stat-number">{details.posts?.length || 0}</div>
              <div className="kids-stat-label">Videos</div>
            </div>
            <div className="kids-stat-item">
              <div className="kids-stat-number">{details.followers?.length || 0}</div>
              <div className="kids-stat-label">Fans</div>
            </div>
            <div className="kids-stat-item">
              <div className="kids-stat-number">{details.followings?.length || 0}</div>
              <div className="kids-stat-label">Following</div>
            </div>
          </div>
        </div>

        {/* --- BIO --- */}
        <div className="kids-bio-section">
          <div className="kids-display-name">{details.display_name || details.full_name}</div>
          <div className="kids-bio-text">{details.bio}</div>
          <div className="kids-links">
            {details.links?.map((link, i) => (
              <div key={i}><a href={link} target="_blank" rel="noreferrer">{link}</a></div>
            ))}
          </div>
        </div>

        {/* --- BUTTONS --- */}
        <div className="kids-actions">
          {ProfileUsername.username === loggedInUsername ? (
            <>
              <button className="kids-btn kids-btn-primary" onClick={() => navigate("/edit_profile")}>
                Edit Profile
              </button>
              <button className="kids-btn kids-btn-secondary" onClick={handleShare}>
                Share
              </button>
            </>
          ) : (
            <>
              <button className="kids-btn kids-btn-primary">{relationship || "Follow"}</button>
              <button className="kids-btn kids-btn-secondary" onClick={handleShare}>Share</button>
            </>
          )}
        </div>

        {/* --- TABS --- */}
        {canSeeContent() ? (
          <>
            <div className="kids-tabs">
              <button 
                className={`kids-tab ${activeTab === 'channels' ? 'active' : ''}`} 
                onClick={() => setActiveTab('channels')}
              >
                <Tv size={20} />
                <span>Channels</span>
              </button>
              
              <button 
                className={`kids-tab ${activeTab === 'liked' ? 'active' : ''}`} 
                onClick={() => setActiveTab('liked')}
              >
                <Heart size={20} />
                <span>Liked</span>
              </button>

              <button 
                className={`kids-tab ${activeTab === 'saved' ? 'active' : ''}`} 
                onClick={() => setActiveTab('saved')}
              >
                <Bookmark size={20} />
                <span>Saved</span>
              </button>
            </div>

            {/* --- GRID CONTENT --- */}
            <div className="kids-grid">
              {getContent().length === 0 ? (
                <div className="kids-empty-msg">No {activeTab} yet! 🌟</div>
              ) : (
                getContent().map((item) => (
                  <div key={item._id || item.id} className="kids-grid-item">
                     {item.type === "Img" ? (
                      <img src={item.url} alt="Post" className="kids-grid-img" />
                    ) : (
                      <video src={item.url} className="kids-grid-img" />
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="kids-empty-msg">🔒 This account is private.</div>
        )}

      </div>
    </div>
  );
};

export default KidsProfile;