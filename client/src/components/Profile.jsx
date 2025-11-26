import React, { useEffect, useState } from 'react';
import { User, Settings, Grid, Heart, Bookmark, Archive } from 'lucide-react';
import { UserDataProvider, useUserData } from '../providers/userData.jsx';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const { userData } = useUserData();
  const ProfileUsername = useParams();
  const navigate = useNavigate();
  const { username } = userData;
  // console.log(ProfileUsername.username, username);
  const [full_name, setFull_name] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [pfp, setPfp] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [type, setType] = useState("");
  const [visibility, setVisibility] = useState("");
  const [links, setLinks] = useState([]);
  const [display_name, setDisplay_name] = useState("");
  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState([]);
  const [saved, setSaved] = useState([]);
  const [archived, setArchived] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayType, setOverlayType] = useState("");
  const [relationship, setRelationship] = useState("");
  const [href, setHref] = useState("");
  const [loading, setLoading] = useState(true);

  const handleShare = async (username) => {
    const url = `http://localhost:5173/profile/${username}`;

    // ✔ If Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this profile',
          url,
        });
      } catch (err) {
        console.log('Share cancelled', err);
      }
    } else {
      // ✔ Fallback (copies URL to clipboard)
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const fetchBasic = async (username) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/profile/getbasic/${username}`,
      {
        method: "GET",
        credentials: "include"
      },
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
      setLinks(details.links);
      setDisplay_name(details.display_name);
      // console.log(links);
      // console.log(details);
    } else {
      console.log("error");
    }
  }

  const fetchSensitive = async (username) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/profile/sensitive/${username}`,
      {
        method: "GET",
        credentials: "include"
      },
    );
    const data = await res.json();
    if (data.success) {
      const { followers, followings, posts, saved, liked, archived } = data.details;
      setFollowers(followers);
      setFollowings(followings);
      setPosts(posts);
      setSaved(saved);
      setLiked(liked);
      setArchived(archived);
      // console.log(data.details);
    } else {
      console.log("Error");
    }
  };

  useEffect(() => {
    if (ProfileUsername.username) {
      setLoading(true);

      Promise.all([
        fetchBasic(ProfileUsername.username),
        fetchSensitive(ProfileUsername.username)
      ])
        .then(() => {
          setLoading(false);
        });
    }
  }, [ProfileUsername.username]);

  const OpenFollower = () => {
    setOverlayType("followers");
    setShowOverlay(true);
  }

  const OpenFollowings = () => {
    setOverlayType("followings");
    setShowOverlay(true);
  }

  const closeOverlay = () => {
    setShowOverlay(false);
    setOverlayType("");
  };

  const isFriend = async (username) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/isfriend/${username}`,
      {
        method: "GET",
        credentials: "include"
      },
    );
    const data = await res.json();
    // console.log(data);
    setRelationship(data.relationship);
    setHref(data.href);
  }

  useEffect(() => {
    if (ProfileUsername.username && ProfileUsername.username !== username) isFriend(ProfileUsername.username)
  });

  const updateRelationship = (mf, sf, username) => {
    let r = "";
    let h = "";

    if (!sf && mf) {
      r = "Requested";
      h = `/unrequest/${username}`;
    }
    else if (!sf && !mf) {
      r = "Follow";
      h = `/follow/${username}`;
    }
    else if (sf && mf) {
      r = "Unfollow";
      h = `/unfollow/${username}`;
    }
    else if (sf && !mf) {
      r = "Follow back";
      h = `/follow/${username}`;
    }

    setRelationship(r);
    setHref(h);
  };

  const canSeeContent = () => {
    // 1. If user is viewing their own profile → always show content
    if (ProfileUsername.username === username) return true;

    // 2. If profile visibility is public → show content
    if (visibility === "Public") return true;

    // 3. Private profile → only show content if relationship allows
    if (relationship === "Unfollow") return true;

    // 4. In all other cases → hide content
    return false;
  };


  const Action = async () => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}${href}`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    if (data.success) {

      // Update follow states locally
      if (relationship === "Follow") {
        // mainUser started following sideUser
        setMainFollowsSide(true);
      }

      else if (relationship === "Requested") {
        // cancel request
        setMainFollowsSide(false);
      }

      else if (relationship === "Unfollow") {
        // unfollow
        setMainFollowsSide(false);
      }

      else if (relationship === "Follow back") {
        // follow them back
        setMainFollowsSide(true);
      }

      // Now recalc new relationship + href 
      updateRelationship(
        mainFollowsSide,
        sideFollowsMain,
        sideUser.username
      );
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
    <div style={styles.container}>
      <div style={styles.profileCard}>
        {/* Header with Settings */}
        <div style={styles.header}>
          <h2 style={styles.username}><strong>{display_name} - {ProfileUsername.username}</strong></h2>
          {ProfileUsername.username === username ? (
            <button style={styles.settingsBtn} onClick={() => navigate("/settings")}>
              <Settings size={20} />
            </button>
          ) : (
            <div></div>
          )}
        </div>

        {/* Profile Info */}
        <div style={styles.profileInfo}>
          <div style={styles.avatarContainer}>
            <img src={pfp || null} style={styles.avatar} />
          </div>

          <div style={styles.stats}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{posts.length}</div>
              <div style={styles.statLabel}>Posts</div>
            </div>
            <div style={styles.statItem} onClick={() => OpenFollower()}>
              <div style={styles.statNumber}>{followers.length}</div>
              <div style={styles.statLabel}>Followers</div>
            </div>
            <div style={styles.statItem} onClick={() => OpenFollowings()}>
              <div style={styles.statNumber}>{followings.length}</div>
              <div style={styles.statLabel}>Following</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div style={styles.bio}>
          <h3 style={styles.displayName}>@{full_name}</h3>

          <p style={styles.bioText}>
            {bio}
          </p>

          {/* Show links only if not empty */}
          {links && links.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              {links.map((link, index) => (
                <p key={index} style={{ margin: "4px 0" }}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#0095f6",
                      textDecoration: "none",
                      fontWeight: "600",
                      wordBreak: "break-all"
                    }}
                  >
                    {link}
                  </a>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {ProfileUsername.username === username ? (
          <div style={styles.actions}>
            <button style={styles.editBtn} onClick={() => navigate("/edit_profile")}>Edit Profile</button>
            <button style={styles.shareBtn} onClick={() => handleShare(ProfileUsername.username)}>Share Profile</button>
          </div>
        ) : (
          <div style={styles.actions}>
            <button style={styles.editBtn} onClick={() => Action(href)}>{relationship}</button>
            <button style={styles.shareBtn} onClick={() => handleShare(ProfileUsername.username)}>Share Profile</button>
            {/* <button style={styles.editBtn} onClick={() => navigate("/edit_profile")}>Edit Profile</button> */}
            {/* <button style={styles.shareBtn} onClick={() => handleShare(ProfileUsername.username)}>Share Profile</button> */}
          </div>
        )}


        {/* Tabs */}
        {canSeeContent() ? (
          <>
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
              {getContent().length === 0 ? (
                <div style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#8e8e8e",
                  fontSize: "18px",
                  fontWeight: "500"
                }}>
                  No {activeTab} yet
                </div>
              ) : (
                getContent().map(post => (
                  <div key={post.id} style={styles.gridItem}>
                    {post.type === "Img" ? (
                      <img src={post.url} alt="Post" style={styles.gridImage} />
                    ) : (
                      <video src={post.url} alt="Reel" style={styles.gridImage} />
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "40px 0",
            fontSize: "18px",
            color: "#555",
            fontWeight: "600"
          }}>
            🔒 This account is private
            <br />
            Follow to see their posts.
          </div>
        )}
      </div>
      {showOverlay && canSeeContent() && (
        <div style={styles.fullOverlay}>
          <div style={styles.modalBox}>

            <h2>{overlayType === "followers" ? "Followers" : "Following"}</h2>

            {(overlayType === "followers" ? followers : followings).map((user, index) => (
              <div
                key={index}
                style={styles.modalUser}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f2f2f2'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                onClick={() => { closeOverlay(); navigate(`/profile/${user.username}`) }}
              >
                {user.username}
              </div>
            ))}

            <button style={styles.closeBtn} onClick={closeOverlay}>Close</button>
          </div>
        </div>
      )}
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
    cursor: 'pointer',
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
    maxHeight: '300px',
    overflowY: 'auto',
    gap: '4px',
    padding: '4px',
  },
  gridItem: {
    position: 'relative',
    paddingBottom: '100%',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '1px solid black'
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
  blurPage: {
    filter: 'blur(6px)',
    pointerEvents: 'none',
  },

  // ---- FULLSCREEN OVERLAY BACKDROP ----
  fullOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5000,
  },

  // ---- MODAL POPUP BOX ----
  modalBox: {
    backgroundColor: '#fff',
    width: '350px',
    maxHeight: '70vh',
    padding: '20px',
    borderRadius: '14px',
    overflowY: 'auto',
    boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
    animation: 'fadeIn 0.25s ease',
  },

  // ---- EACH USER ITEM ----
  modalUser: {
    padding: '12px',
    borderBottom: '1px solid #e5e5e5',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#262626',
    transition: 'background 0.2s',
  },

  modalUserHover: {
    backgroundColor: '#f2f2f2',
  },

  // ---- CLOSE BUTTON ----
  closeBtn: {
    marginTop: '16px',
    padding: '10px 18px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    width: '100%',
  },
  loaderOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(255,255,255,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  spinner: {
    width: "50px",
    height: "50px",
    border: "6px solid #ddd",
    borderTopColor: "#0095f6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  }

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
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ProfilePage;
