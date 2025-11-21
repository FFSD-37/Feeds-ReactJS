import React, { useState, useEffect } from 'react';
import {
  MoreHorizontal,
  File,
  MessageCircle,
  Heart,
  Share2,
} from 'lucide-react';
import '../styles/Landing.css';
import { useUserData } from '../providers/userData.jsx';
import { useNavigate } from 'react-router-dom';

const WinkuSocial = () => {
  const { userData } = useUserData();
  const [allPosts, setAllPosts] = useState([]);
  const [friends, setFriends] = useState([]);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);

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

  console.log(allPosts);

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
                      <h3 className="post-author-name">{post.author}</h3>
                      <p className="post-timestamp">
                        {timeAgo(new Date(post.createdAt))}
                      </p>
                    </div>
                    <button className="icon-button">
                      <MoreHorizontal
                        style={{
                          width: '20px',
                          height: '20px',
                          color: '#6b7280',
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
                    <div className="post-stat">
                      <MessageCircle
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span>{post.comments.length}</span>
                    </div>
                    <div className="post-stat">
                      <Heart style={{ width: '16px', height: '16px' }} />
                      <span>{post.likes}</span>
                    </div>
                    <button className="icon-button post-stat-auto">
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
        <div className="sidebar-section">
          {/* Create Page Card */}
          <div className="create-page-card">
            <div className="create-page-icon">
              <File
                style={{ width: '24px', height: '24px', color: 'white' }}
              />
            </div>
            <h3 className="create-page-title">
              CREATE YOUR OWN FAVOURITE CHANNEL.
            </h3>
            <button className="create-page-button">Start Now!</button>
          </div>
        </div>

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
      </aside>
    </div>
  );
};

export default WinkuSocial;
