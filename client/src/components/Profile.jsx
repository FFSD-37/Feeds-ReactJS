import React, { useEffect, useState, useCallback } from 'react';
import { User, Settings, Grid, Heart, Bookmark, Archive, Flag, Ban, Trash2, Download, Upload } from 'lucide-react';
import { UserDataProvider, useUserData } from '../providers/userData.jsx';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const { userData } = useUserData();
  const ProfileUsername = useParams();
  const navigate = useNavigate();
  const { username, type: loggedInUserType } = userData || {};

  // Basic Profile Data
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

  // Content Data
  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState([]);
  const [saved, setSaved] = useState([]);
  const [archived, setArchived] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);

  // UI State
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayType, setOverlayType] = useState('');
  const [relationship, setRelationship] = useState('');
  const [href, setHref] = useState('');
  const [mainFollowsSide, setMainFollowsSide] = useState(false);
  const [sideFollowsMain, setSideFollowsMain] = useState(false);
  const [sideUser, setSideUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedFollowers, setExpandedFollowers] = useState(false);
  const [expandedFollowings, setExpandedFollowings] = useState(false);
  const [followerSearchQuery, setFollowerSearchQuery] = useState('');
  const [followingSearchQuery, setFollowingSearchQuery] = useState('');

  // Pagination
  const [postsPage, setPostsPage] = useState(1);
  const [followersPage, setFollowersPage] = useState(1);
  const [followingsPage, setFollowingsPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

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
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/profile/getbasic/${username}`,
        { method: 'GET', credentials: 'include' }
      );
      const data = await res.json();
      if (data.isBlocked === true) {
        setIsBlocked(true);
        return;
      }
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
      }
    } catch (error) {
      console.error('Error fetching basic profile:', error);
    }
  };

  const fetchSensitive = async (username) => {
    try {
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
      }
    } catch (error) {
      console.error('Error fetching sensitive profile:', error);
    }
  };

  useEffect(() => {
    if (ProfileUsername.username) {
      setLoading(true);
      setPostsPage(1);
      setFollowersPage(1);
      setFollowingsPage(1);
      Promise.all([
        fetchBasic(ProfileUsername.username),
        fetchSensitive(ProfileUsername.username)
      ]).then(() => setLoading(false));
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
    setFollowerSearchQuery('');
    setFollowingSearchQuery('');
  };

  const isFriend = async (username) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/isfriend/${username}`,
        { method: 'GET', credentials: 'include' }
      );
      const data = await res.json();
      setRelationship(data.relationship);
      setHref(data.href);
    } catch (error) {
      console.error('Error checking friendship:', error);
    }
  };

  useEffect(() => {
    if (ProfileUsername.username && ProfileUsername.username !== username) {
      isFriend(ProfileUsername.username);
    }
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
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/block/${ProfileUsername.username}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      alert(`User ${data.flag} successfully`);
      window.location.href = '/home';
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblockUser = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/block/${ProfileUsername.username}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.flag === 'unblocked') {
        setIsBlocked(false);
        alert('User unblocked successfully');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const handleReportUser = () => {
    // Implement report functionality
    alert('Report feature coming soon');
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/delete/${postId}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.data === true) {
        setPosts(posts.filter(p => p.id !== postId));
        setShowPostModal(false);
        alert('Post deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleArchivePost = async (postId, isArchived) => {
    try {
      const endpoint = isArchived ? 'unarchive' : 'archive';
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/${endpoint}/${postId}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.data === true) {
        if (isArchived) {
          // Move from archived to posts
          const post = archived.find(p => p.id === postId);
          setArchived(archived.filter(p => p.id !== postId));
          if (post) setPosts([...posts, post]);
        } else {
          // Move from posts to archived
          const post = posts.find(p => p.id === postId);
          setPosts(posts.filter(p => p.id !== postId));
          if (post) setArchived([...archived, post]);
        }
        alert(`Post ${isArchived ? 'un' : ''}archived successfully`);
      }
    } catch (error) {
      console.error('Error archiving post:', error);
    }
  };

  const canSeeContent = useCallback(() => {
    // Own profile
    if (ProfileUsername.username === username) return true;

    // User is blocked
    if (isBlocked) return false;

    // Public profile
    if (visibility === 'Public') return true;

    // Private profile - can see if following or is follower
    if (visibility === 'Private' && (relationship === 'Unfollow' || sideFollowsMain)) {
      return true;
    }

    return false;
  }, [ProfileUsername.username, username, visibility, relationship, sideFollowsMain, isBlocked]);

  const shouldShowTabs = useCallback(() => {
    // Own profile - show all tabs
    if (ProfileUsername.username === username) return true;

    // Logged in user is a channel - no tabs for other profiles
    if (loggedInUserType === 'Channel') return false;

    // Private profile that user doesn't follow - no tabs
    if (visibility === 'Private' && relationship !== 'Unfollow') return false;

    // Public profile or followed private - show only posts tab
    return true;
  }, [ProfileUsername.username, username, loggedInUserType, visibility, relationship]);

  const shouldShowFollowStats = useCallback(() => {
    // Own profile - show all
    if (ProfileUsername.username === username) return true;

    // Logged in user is a channel - don't show followers/followings
    if (loggedInUserType === 'Channel') return false;

    // Private profile that user doesn't follow - don't show
    if (visibility === 'Private' && relationship !== 'Unfollow') return false;

    return true;
  }, [ProfileUsername.username, username, loggedInUserType, visibility, relationship]);

  const getTabs = useCallback(() => {
    if (ProfileUsername.username === username) {
      return [
        { id: 'posts', label: 'Posts', icon: Grid },
        { id: 'liked', label: 'Liked', icon: Heart },
        { id: 'saved', label: 'Saved', icon: Bookmark },
        { id: 'archived', label: 'Archived', icon: Archive }
      ];
    }
    return [{ id: 'posts', label: 'Posts', icon: Grid }];
  }, [ProfileUsername.username, username]);

  const Action = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}${href}`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        if (relationship === 'Follow' || relationship === 'Follow back') {
          setMainFollowsSide(true);
        } else {
          setMainFollowsSide(false);
        }
        updateRelationship(mainFollowsSide, sideFollowsMain, sideUser.username);
      }
    } catch (error) {
      console.error('Error performing action:', error);
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

  const getPaginatedContent = (content, page) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return content.slice(start, end);
  };

  const getPaginatedFollowers = () => {
    const filtered = followers.filter(f =>
      f.username.toLowerCase().includes(followerSearchQuery.toLowerCase())
    );
    return getPaginatedContent(filtered, followersPage);
  };

  const getPaginatedFollowings = () => {
    const filtered = followings.filter(f =>
      f.username.toLowerCase().includes(followingSearchQuery.toLowerCase())
    );
    return getPaginatedContent(filtered, followingsPage);
  };

  const getTotalPages = (content) => {
    return Math.ceil(content.length / ITEMS_PER_PAGE);
  };

  const PostDetailModal = ({ post, onClose, onDelete, onArchive }) => {
    const isArchived = activeTab === 'archived';
    return (
      <div className="profile-modal-overlay" onClick={onClose}>
        <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
          <button className="profile-modal-close" onClick={onClose}>×</button>

          <div className="profile-modal-body">
            <div className="profile-modal-image">
              {post.type === 'Img' ? (
                <img src={post.url} alt="Post" />
              ) : (
                <video src={post.url} controls />
              )}
            </div>

            <div className="profile-modal-info">
              <h3>Post Details</h3>
              {post.caption && <p><strong>Caption:</strong> {post.caption}</p>}
              <p><strong>Posted:</strong> {new Date(post.createdAt).toLocaleDateString()}</p>

              {ProfileUsername.username === username && (
                <div className="profile-modal-actions">
                  <button
                    className="profile-action-btn delete"
                    onClick={() => onDelete(post.id)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                  <button
                    className="profile-action-btn archive"
                    onClick={() => onArchive(post.id, isArchived)}
                  >
                    {isArchived ? <Upload size={16} /> : <Download size={16} />}
                    {isArchived ? ' Unarchive' : ' Archive'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (isBlocked) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-blocked-message">
            <Ban size={48} />
            <h2>You are blocked</h2>
            <p>This user has blocked you. You cannot view their profile or interact with them.</p>
            <button className="profile-btn primary" onClick={handleUnblockUser}>
              Unblock User
            </button>
            <button className="profile-btn" onClick={() => navigate('/home')}>
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            {shouldShowFollowStats() && (
              <>
                <div className="profile-stat" onClick={OpenFollower}>
                  <div className="profile-stat-num">{followers.length}</div>
                  <div className="profile-stat-label">Followers</div>
                </div>
                <div className="profile-stat" onClick={OpenFollowings}>
                  <div className="profile-stat-num">{followings.length}</div>
                  <div className="profile-stat-label">Following</div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="profile-bio">
          <h3 className="profile-display">{full_name}</h3>
          <p className="profile-bio-text">{bio}</p>
          {links && links.length > 0 && (
            <div className="profile-links">
              {links.map((link, index) => (
                <p key={index} className="profile-link-item">
                  <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                </p>
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
          ) : loggedInUserType !== 'Channel' ? (
            <>
              <button className="profile-btn primary" onClick={Action}>{relationship || 'Follow'}</button>
              <button className="profile-btn" onClick={() => handleShare(ProfileUsername.username)}>Share Profile</button>
            </>
          ) : (
            <button className="profile-btn" onClick={() => handleShare(ProfileUsername.username)}>Share Profile</button>
          )}
        </div>

        {!canSeeContent() ? (
          <div className="profile-private">
            {visibility === 'Private' ? (
              <>
                <h3>This account is private</h3>
                <p>Follow to see their posts, followers, and following.</p>
              </>
            ) : (
              <h3>Unable to view this profile</h3>
            )}
          </div>
        ) : (
          <>
            {shouldShowTabs() && (
              <nav className="profile-tabs">
                {getTabs().map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon size={16} /> <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            <div className="profile-grid">
              {getContent().length === 0 ? (
                <div className="profile-empty">No {activeTab} yet</div>
              ) : (
                getPaginatedContent(getContent(), activeTab === 'posts' ? postsPage : activeTab === 'liked' ? 1 : activeTab === 'saved' ? 1 : 1).map((post) => (
                  <div
                    key={post.id}
                    className="profile-grid-item"
                    onClick={() => {
                      setSelectedPost(post);
                      setShowPostModal(true);
                    }}
                  >
                    {post.type === 'Img' ? (
                      <img src={post.url} alt="Post" className="profile-grid-media" />
                    ) : (
                      <video src={post.url} className="profile-grid-media" />
                    )}
                  </div>
                ))
              )}
            </div>

            {getContent().length > ITEMS_PER_PAGE && (
              <div className="profile-pagination">
                {Array.from({ length: getTotalPages(getContent()) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`profile-page-btn ${activeTab === 'posts' ? postsPage === page ? 'active' : '' : 'active'}`}
                    onClick={() => {
                      if (activeTab === 'posts') setPostsPage(page);
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showPostModal && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setShowPostModal(false)}
          onDelete={handleDeletePost}
          onArchive={handleArchivePost}
        />
      )}

      {showOverlay && canSeeContent() && (
        <div className="profile-overlay" role="dialog">
          <div className="profile-overlay-content">
            <h3>{overlayType === 'followers' ? 'Followers' : 'Following'}</h3>
            <button className="profile-close-btn" onClick={closeOverlay}>×</button>

            <input
              type="text"
              placeholder={`Search ${overlayType}...`}
              className="profile-overlay-search"
              value={overlayType === 'followers' ? followerSearchQuery : followingSearchQuery}
              onChange={(e) => {
                if (overlayType === 'followers') {
                  setFollowerSearchQuery(e.target.value);
                  setFollowersPage(1);
                } else {
                  setFollowingSearchQuery(e.target.value);
                  setFollowingsPage(1);
                }
              }}
            />

            <div className="profile-overlay-list">
              {overlayType === 'followers'
                ? getPaginatedFollowers().length > 0
                  ? getPaginatedFollowers().map((user, index) => (
                      <div
                        key={index}
                        className="profile-overlay-user"
                        onClick={() => {
                          closeOverlay();
                          navigate(`/profile/${user.username}`);
                        }}
                      >
                        {user.username}
                      </div>
                    ))
                  : <div className="profile-no-results">No followers found</div>
                : getPaginatedFollowings().length > 0
                  ? getPaginatedFollowings().map((user, index) => (
                      <div
                        key={index}
                        className="profile-overlay-user"
                        onClick={() => {
                          closeOverlay();
                          navigate(`/profile/${user.username}`);
                        }}
                      >
                        {user.username}
                      </div>
                    ))
                  : <div className="profile-no-results">No following found</div>
              }
            </div>

            {/* Overlay Pagination */}
            {(overlayType === 'followers'
              ? followers.filter(f => f.username.toLowerCase().includes(followerSearchQuery.toLowerCase())).length > ITEMS_PER_PAGE
              : followings.filter(f => f.username.toLowerCase().includes(followingSearchQuery.toLowerCase())).length > ITEMS_PER_PAGE) && (
              <div className="profile-overlay-pagination">
                {Array.from(
                  {
                    length: getTotalPages(
                      overlayType === 'followers'
                        ? followers.filter(f => f.username.toLowerCase().includes(followerSearchQuery.toLowerCase()))
                        : followings.filter(f => f.username.toLowerCase().includes(followingSearchQuery.toLowerCase()))
                    )
                  },
                  (_, i) => i + 1
                ).map(page => (
                  <button
                    key={page}
                    className={`profile-overlay-page-btn ${overlayType === 'followers' ? followersPage === page ? 'active' : '' : followingsPage === page ? 'active' : ''}`}
                    onClick={() => {
                      if (overlayType === 'followers') {
                        setFollowersPage(page);
                      } else {
                        setFollowingsPage(page);
                      }
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
