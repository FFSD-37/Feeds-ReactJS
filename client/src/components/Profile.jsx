import React, { useEffect, useState } from 'react';
import { User, Settings, Grid, Heart, Bookmark, Archive, Flag, Ban } from 'lucide-react';
import { UserDataProvider, useUserData } from '../providers/userData.jsx';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const { userData } = useUserData();
  const ProfileUsername = useParams();
  const navigate = useNavigate();
  const { username } = userData || {};

  const [full_name, setFull_name] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [pfp, setPfp] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [type, setType] = useState('');
  const [visibility, setVisibility] = useState('');
  const [links, setLinks] = useState([]);
  const [display_name, setDisplay_name] = useState('');
  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState([]);
  const [saved, setSaved] = useState([]);
  const [archived, setArchived] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayType, setOverlayType] = useState('');
  const [relationship, setRelationship] = useState('');
  const [href, setHref] = useState('');
  const [mainFollowsSide, setMainFollowsSide] = useState(false);
  const [sideFollowsMain, setSideFollowsMain] = useState(false);
  const [sideUser, setSideUser] = useState({});
  const [loading, setLoading] = useState(true);

  const handleShare = async (username) => {
    const url = `http://localhost:5173/profile/${username}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check out this profile', url });
      } catch (err) {
        console.log('Share cancelled', err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const fetchBasic = async (username) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/profile/getbasic/${username}`,
      { method: 'GET', credentials: 'include' }
    );
    const data = await res.json();
    if (data.success) {
      const details = data.details;
      setFull_name(details.full_name);
      setEmail(details.email);
      setPhone(details.phone);
      setDob(details.dob);
      setPfp(details.pfp);
      setBio(details.bio);
      setGender(details.gender);
      setIsPremium(details.isPremium);
      setType(details.type);
      setVisibility(details.visibility);
      setLinks(details.links || []);
      setDisplay_name(details.display_name);
    } else {
      console.log('error');
    }
  };

  const fetchSensitive = async (username) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/profile/sensitive/${username}`,
      { method: 'GET', credentials: 'include' }
    );
    const data = await res.json();
    if (data.success) {
      const { followers, followings, posts, saved, liked, archived } = data.details;
      setFollowers(followers || []);
      setFollowings(followings || []);
      setPosts(posts || []);
      setSaved(saved || []);
      setLiked(liked || []);
      setArchived(archived || []);
    } else {
      console.log('Error');
    }
  };

  useEffect(() => {
    if (ProfileUsername.username) {
      setLoading(true);
      Promise.all([fetchBasic(ProfileUsername.username), fetchSensitive(ProfileUsername.username)]).then(() => setLoading(false));
    }
  }, [ProfileUsername.username]);

  const OpenFollower = () => {
    setOverlayType('followers');
    setShowOverlay(true);
  };

  const OpenFollowings = () => {
    setOverlayType('followings');
    setShowOverlay(true);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setOverlayType('');
  };

  const isFriend = async (username) => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/isfriend/${username}`, { method: 'GET', credentials: 'include' });
    const data = await res.json();
    setRelationship(data.relationship);
    setHref(data.href);
  };

  useEffect(() => {
    if (ProfileUsername.username && ProfileUsername.username !== username) isFriend(ProfileUsername.username);
  }, [ProfileUsername.username, username]);

  const updateRelationship = (mf, sf, username) => {
    let r = '';
    let h = '';
    if (!sf && mf) {
      r = 'Requested';
      h = `/unrequest/${username}`;
    } else if (!sf && !mf) {
      r = 'Follow';
      h = `/follow/${username}`;
    } else if (sf && mf) {
      r = 'Unfollow';
      h = `/unfollow/${username}`;
    } else if (sf && !mf) {
      r = 'Follow back';
      h = `/follow/${username}`;
    }
    setRelationship(r);
    setHref(h);
  };

  const handleBlockUser = async () => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/block/${ProfileUsername.username}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    alert(`User ${data.flag} successfully`);
    window.location.href = '/home';
  };

  const handleReportUser = () => {};

  const canSeeContent = () => {
    if (ProfileUsername.username === username) return true;
    if (visibility === 'Public') return true;
    if (relationship === 'Unfollow') return true;
    return false;
  };

  const Action = async () => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}${href}`, { method: 'POST', credentials: 'include', body: JSON.stringify({}) });
    const data = await res.json();
    if (data.success) {
      if (relationship === 'Follow' || relationship === 'Follow back') setMainFollowsSide(true);
      else setMainFollowsSide(false);
      updateRelationship(mainFollowsSide, sideFollowsMain, sideUser.username);
    }
  };

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
    <div className="profile-container">
      <div className="profile-card">
        <header className="profile-header">
          <h2 className="profile-username">{display_name} <span className="profile-slug">- {ProfileUsername.username}</span></h2>
          {ProfileUsername.username === username ? (
            <button className="profile-settings-btn" onClick={() => navigate('/settings')} aria-label="settings">
              <Settings size={18} />
            </button>
          ) : (
            <div className="profile-action-icons">
              <button className="profile-icon-btn" title="Report this user" onClick={handleReportUser}><Flag size={16} /></button>
              <button className="profile-icon-btn" title="Block this user" onClick={handleBlockUser}><Ban size={16} /></button>
            </div>
          )}
        </header>

        <section className="profile-top">
          <div className="profile-avatar-wrap">
            <img className="profile-avatar" src={pfp || ''} alt={`${display_name || ProfileUsername.username} avatar`} />
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-num">{posts.length + archived.length}</div>
              <div className="profile-stat-label">Posts</div>
            </div>
            <div className="profile-stat" onClick={OpenFollower}>
              <div className="profile-stat-num">{followers.length}</div>
              <div className="profile-stat-label">Followers</div>
            </div>
            <div className="profile-stat" onClick={OpenFollowings}>
              <div className="profile-stat-num">{followings.length}</div>
              <div className="profile-stat-label">Following</div>
            </div>
          </div>
        </section>

        <section className="profile-bio">
          <h3 className="profile-display">@{full_name}</h3>
          <p className="profile-bio-text">{bio}</p>
          {links && links.length > 0 && (
            <div className="profile-links">
              {links.map((link, index) => (
                <p key={index} className="profile-link-item"><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></p>
              ))}
            </div>
          )}
        </section>

        <div className="profile-actions">
          {ProfileUsername.username === username ? (
            <>
              <button className="profile-btn primary" onClick={() => navigate('/edit_profile')}>Edit Profile</button>
              <button className="profile-btn" onClick={() => handleShare(ProfileUsername.username)}>Share Profile</button>
            </>
          ) : (
            <>
              <button className="profile-btn primary" onClick={Action}>{relationship || 'Follow'}</button>
              <button className="profile-btn" onClick={() => handleShare(ProfileUsername.username)}>Share Profile</button>
            </>
          )}
        </div>

        {canSeeContent() ? (
          <>
            <nav className="profile-tabs">
              <button className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}><Grid size={16} /> <span>Posts</span></button>
              <button className={`profile-tab ${activeTab === 'liked' ? 'active' : ''}`} onClick={() => setActiveTab('liked')}><Heart size={16} /> <span>Liked</span></button>
              <button className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}><Bookmark size={16} /> <span>Saved</span></button>
              <button className={`profile-tab ${activeTab === 'archived' ? 'active' : ''}`} onClick={() => setActiveTab('archived')}><Archive size={16} /> <span>Archived</span></button>
            </nav>

            <div className="profile-grid">
              {getContent().length === 0 ? (
                <div className="profile-empty">No {activeTab} yet</div>
              ) : (
                getContent().map((post) => (
                  <div key={post.id} className="profile-grid-item">
                    {post.type === 'Img' ? (
                      <img src={post.url} alt="Post" className="profile-grid-media" />
                    ) : (
                      <video src={post.url} className="profile-grid-media" />
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="profile-private">🔒 This account is private<br />Follow to see their posts.</div>
        )}
      </div>

      {showOverlay && canSeeContent() && (
        <div className="profile-overlay" role="dialog">
          <div className="profile-overlay-content">
            <h3>{overlayType === 'followers' ? 'Followers' : 'Following'}</h3>
            <button className="profile-close-btn" onClick={closeOverlay}>×</button>
            <div className="profile-overlay-list">
              {(overlayType === 'followers' ? followers : followings).map((user, index) => (
                <div key={index} className="profile-overlay-user" onClick={() => { closeOverlay(); navigate(`/profile/${user.username}`); }}>{user.username}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
