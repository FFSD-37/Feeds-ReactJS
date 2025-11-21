import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  File,
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
} from 'lucide-react';
import '../styles/Landing.css';
import { useUserData } from '../providers/userData.jsx';
import { useNavigate } from 'react-router-dom';

const WinkuSocial = () => {
  const { userData } = useUserData();
  const [allPosts, setAllPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [allAds, setAds] = useState([]);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const navigate = useNavigate();

  const getAllPosts = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/home/getAllPosts`,
      {
        method: 'GET',
        credentials: 'include',
      },
    );
    const data = await res.json();

    if (data.success) {
      setAllPosts(data.posts);
    }
    setLoadingPosts(false);
  };

  useEffect(() => {
    getAllPosts();
  }, []);

  // console.log(allPosts);

  const getFriends = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/home/getFriends`,
      {
        method: 'GET',
        credentials: 'include',
      },
    );
    const data = await res.json();

    if (data.success) {
      setFriends(data.friends);
    }
    setLoadingFriends(false);
  };

  useEffect(() => {
    getFriends();
  }, []);

  const getAds = async () => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/home/ads`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    // console.log(data)
    if (data.success) {
      setAds(data.allAds);
    }
  };

  useEffect(() => {
    getAds();
  }, []);

  // console.log(allAds);

  const toggleSave = async postId => {
    // Instant UI update
    setAllPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, saved: !p.saved } : p)),
    );

    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/post/saved/${postId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      },
    );
    // 🔥 YOUR API CALL HERE
    // await fetch(`${import.meta.env.VITE_SERVER_URL}/post/save/${postId}`, { method: "POST", credentials: "include" });
  };

  const selectReason = async (reason) => {
    setShowReportModal(false);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/report_post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            reason,
            post_id: selectedPostId
          }),
        }
      );
  
      const data = await res.json();
  
      if (data.success) {
        alert(`Post reported - id: ${data.reportId}`);
      } else {
        alert(data.message || "Something went wrong");
      }
  
    } catch (err) {
      console.log("Error reporting post:", err);
    }
  
  };  

  const toggleLike = async postId => {
    setAllPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            liked: !p.liked,
            likes: p.liked ? p.likes - 1 : p.likes + 1,
          };
        }
        return p;
      }),
    );

    // 🔥 YOUR API CALL HERE
    // fetch(`/like/toggle/${postId}`, { method: "POST" })
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/post/liked/${postId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      },
    );
  };

  const handleShare = async postId => {
    const url = `http://localhost:5173/post/${postId}`;

    // ✔ If Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check this post!',
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

  function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals = {
      year: 31536000,
      mon: 2592000,
      w: 604800,
      d: 86400,
      h: 3600,
      m: 60,
    };
    for (const [unit, sec] of Object.entries(intervals)) {
      const count = Math.floor(seconds / sec);
      if (count >= 1) return `${count} ${unit}`;
    }
    return 'just now';
  }

  // 🔥 Simple skeleton loader UI
  const PostSkeleton = () => (
    <div className="post-card skeleton">
      <div className="skeleton-header"></div>
      <div className="skeleton-media"></div>
      <div className="skeleton-text"></div>
    </div>
  );

  return (
    <div className="main-layout">
      <main className="main-content">
        <div className="content-section">
          {/* 🔥 If loading, show skeletons */}
          {loadingPosts ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : (
            <div className="post-card">
              {allPosts.map((post, index) => (
                <React.Fragment key={index}>
                  <div className="post-header">
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      className="post-avatar"
                    />
                    <div className="post-author">
                      <h3
                        className="post-author-name"
                        onClick={() => navigate(`/profile/${post.author}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {post.author}
                      </h3>
                      <p className="post-timestamp">
                        {timeAgo(new Date(post.createdAt))}
                      </p>
                    </div>
                    <button
                      className="icon-button"
                      onClick={() => {
                        setSelectedPostId(post.id);
                        setShowReportModal(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <AlertTriangle
                        style={{
                          width: '20px',
                          height: '20px',
                          color: '#ef4444', // red
                        }}
                      />
                    </button>
                  </div>

                  {post.type === 'Img' ? (
                    <img src={post.url} alt="Post" className="post-image" />
                  ) : (
                    <video
                      src={post.url}
                      className="post-image"
                      muted
                      onMouseEnter={e => e.target.play()}
                      onMouseLeave={e => {
                        e.target.pause();
                        e.target.currentTime = 0;
                      }}
                    ></video>
                  )}

                  <div className="post-stats">
                    <div className="post-stat" style={{ cursor: 'pointer' }}>
                      <MessageCircle
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span>{post.comments.length}</span>
                    </div>
                    <div
                      className="post-stat"
                      onClick={() => toggleLike(post.id)} // <— click toggles
                      style={{ cursor: 'pointer' }}
                    >
                      {post.liked ? (
                        <Heart
                          fill="red"
                          color="red"
                          style={{ width: '16px', height: '16px' }}
                        />
                      ) : (
                        <Heart style={{ width: '16px', height: '16px' }} />
                      )}
                      <span>{post.likes}</span>
                    </div>
                    <div
                      className="post-stat"
                      onClick={() => toggleSave(post.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {post.saved ? (
                        <Bookmark
                          fill="blue"
                          color="blue"
                          style={{ width: '16px', height: '16px' }}
                        />
                      ) : (
                        <Bookmark style={{ width: '16px', height: '16px' }} />
                      )}
                    </div>

                    <button
                      className="icon-button post-stat-auto"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleShare(post.id)}
                    >
                      <Share2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>

                  <p className="post-text">{post.content}</p>
                  <hr />
                  <br />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="right-sidebar">
        <br />
        <div className="sidebar-section">
          {/* Create Page Card */}
          <div className="create-page-card">
            <div className="create-page-icon">
              <File style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <h3 className="create-page-title">
              CREATE YOUR OWN FAVOURITE CHANNEL.
            </h3>
            <button className="create-page-button">Start Now!</button>
          </div>
        </div>
        <br />

        {/* FRIENDS SKELETON */}
        <div className="sidebar-section">
          <div className="card">
            <h3 className="card-title">Friends</h3>

            {loadingFriends ? (
              <div className="friends-grid">
                {Array(9)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="friend-avatar skeleton-circle"
                    ></div>
                  ))}
              </div>
            ) : (
              <div className="friends-grid">
                {friends.slice(0, 9).map((friend, index) => (
                  <img
                    key={index}
                    src={friend.avatarUrl}
                    alt={friend.username}
                    className="friend-avatar"
                    onClick={() => navigate(`/profile/${friend.username}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <br />
        {!userData.isPremium ? (
          <div className="sidebar-section">
            <div className="card2">
              {allAds.map((ad, index) => (
                <div key={index} className="single_ad">
                  <a href={ad.url}>
                    <video
                      src={ad.ad_url}
                      className="post-image2"
                      autoPlay
                      muted
                      loop
                    ></video>
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </aside>
      {showReportModal && (
        <div className="report-modal-overlay">
          <div className="report-modal">
            <p className="modal-title">Why are you reporting this post?</p>

            <ul className="report-options">
              {[
                "I just don't like it",
                'Bullying or unwanted contact',
                'Suicide, self-injury or eating disorders',
                'Violence, hate or exploitation',
                'Selling or promoting restricted items',
                'Nudity or sexual activity',
                'Scam, fraud or spam',
                'False information',
              ].map((reason, i) => (
                <li key={i} onClick={() => selectReason(reason)}>
                  {reason} <span>&#8250;</span>
                </li>
              ))}
            </ul>

            <button
              className="close-modal-btn"
              onClick={() => setShowReportModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinkuSocial;
