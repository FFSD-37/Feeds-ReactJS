import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  File,
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import '../styles/Landing.css';
import { useUserData } from '../providers/userData.jsx';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { userData } = useUserData();
  const [allPosts, setAllPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [allAds, setAds] = useState([]);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);

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
    const data = await res.json();
    if (data.success) {
      console.log('saved');
    } else {
      console.log('error');
    }
    // 🔥 YOUR API CALL HERE
    // await fetch(`${import.meta.env.VITE_SERVER_URL}/post/save/${postId}`, { method: "POST", credentials: "include" });
  };

  const selectReason = async reason => {
    setShowReportModal(false);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/report_post`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            reason,
            post_id: selectedPostId,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        alert(`Post reported - id: ${data.reportId}`);
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.log('Error reporting post:', err);
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

  const openComments = async postId => {
    setActivePostId(postId);
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/home/userpost_comments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postID: postId }),
      },
    );

    let data = await res.json();
    if (data.success) {
      setComments(data.comment_array);
    }
    setShowComments(true);
    console.log(comments);
  };

  const [replyBoxVisible, setReplyBoxVisible] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [commentText, setCommentText] = useState('');
  // const [commentNumbers, setCommentNumbers] = useState(0);

  const openReplyBox = commentId => {
    setReplyBoxVisible(commentId);
  };

  const sendReply = async commentId => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/home/userpost_reply`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          commentId,
          reply: replyText,
          postID: activePostId,
        }),
      },
    );

    const data = await res.json();

    if (data.success) {
      // ⭐ UPDATE UI IMMEDIATELY (REAL-TIME REPLY)
      setComments(prev =>
        prev.map(commentPair => {
          const main = commentPair[0];
          const replies = commentPair[1] || [];

          if (main._id === commentId) {
            return [
              main,
              [
                ...replies,
                data.reply, // backend response of the new reply
              ],
            ];
          }

          return commentPair;
        }),
      );
    } else {
      console.log('error!!');
    }

    // close reply UI
    setReplyBoxVisible(null);
    setReplyText('');
  };

  const sendComment = async () => {
    console.log(activePostId);
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ postID: activePostId, commentText: commentText }),
    });
    const data = await res.json();
    if (data.success) {
      setComments(prev => [
        ...prev,
        [
          {
            _id: data.comment._id,
            text: commentText,
            username: userData.username,
            avatarUrl: userData.profileUrl, // if needed
          },
          [], // empty replies
        ],
      ]);
    } else {
      alert(data.message);
    }
    // console.log('Posting new comment:', commentText);

    setCommentText('');
  };

  const reportComment = async commentId => {
    // 🔥 Your API fetch
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/home/comment_report`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ commentId }),
      },
    );
    const data = await res.json();
    if (data.success) {
      alert(`${data.message} with id: ${data.reportId}`);
    } else {
      alert(`${data.message}`);
    }
    // console.log(data);
    // alert(`Reported comment ID: ${commentId}`);
  };

  // 🔥 Simple skeleton loader UI
  // const PostSkeleton = () => (
  //   <div className="post-card skeleton">
  //     <div className="skeleton-header"></div>
  //     <div className="skeleton-media"></div>
  //     <div className="skeleton-text"></div>
  //   </div>
  // );

  return (
    <div className="main-layout">
      {(loadingPosts || loadingFriends) && (
        <div className="loading-overlay">
          <div>
            <div className="loader"></div>
            <h1>Loading</h1>
          </div>
        </div>
      )}
      <main className="main-content">
        <div className="content-section">
          {/* 🔥 If loading, show skeletons */}
          {/* {loadingPosts ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : ( */}
          {!loadingPosts && (
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
                      onMouseEnter={e => e.target.play()}
                      onMouseLeave={e => {
                        e.target.pause();
                        e.target.currentTime = 0;
                      }}
                    ></video>
                  )}

                  <div className="post-stats">
                    <div
                      className="post-stat"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openComments(post.id)}
                    >
                      <MessageCircle
                        style={{ width: '16px', height: '16px' }}
                      />
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
            <h3 className="card-title">recent Friends</h3>

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
                  <div key={index} className="friend-item" onClick={() => navigate(`/profile/${friend.username}`)}>
                    <img
                      src={friend.avatarUrl}
                      alt={friend.username}
                      className="friend-avatar"
                    />
                    <p className="friend-name">{friend.username}</p>
                  </div>
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
      {showComments && (
        <div className="comment-overlay">
          <div className="comment-box">
            {/* HEADER */}
            <div className="comment-header">
              <h3 className="comment-title">Comments</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowComments(false);
                  setShowEmoji(false);
                }}
              >
                ✕
              </button>
            </div>

            {/* LIST */}
            <div className="comment-list">
              {comments.length === 0 && (
                <p className="no-comments">No comments yet</p>
              )}

              {comments.map(commentPair => {
                const main = commentPair[0];
                const replies = commentPair[1] || [];

                return (
                  <div key={main._id} className="comment-item">
                    {/* MAIN COMMENT */}
                    <div
                      className="comment-body"
                      style={{ display: 'flex', gap: '10px' }}
                    >
                      {/* PFP */}
                      <img
                        src={main.avatarUrl}
                        alt={main.username}
                        className="comment-pfp"
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />

                      {/* TEXT */}
                      <div>
                        <p className="comment-text">{main.text}</p>
                        <span className="comment-author">@{main.username}</span>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div
                      className="comment-actions"
                      style={{
                        display: 'flex',
                        gap: '12px',
                        marginLeft: '48px',
                      }}
                    >
                      <button onClick={() => reportComment(main._id)}>
                        Report
                      </button>
                      <button onClick={() => openReplyBox(main._id)}>
                        Reply
                      </button>
                    </div>

                    {/* REPLIES */}
                    {replies.length > 0 && (
                      <div
                        className="reply-list"
                        style={{ marginLeft: '55px' }}
                      >
                        {replies.map((reply, idx) => (
                          <div key={reply._id || idx} className="reply-item">
                            <div style={{ display: 'flex', gap: '10px' }}>
                              {/* PFP */}
                              <img
                                src={reply.avatarUrl}
                                alt={reply.username}
                                className="reply-pfp"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                }}
                              />

                              {/* TEXT */}
                              <div>
                                <p
                                  className="reply-text"
                                  style={{ color: 'black', fontSize: '12px' }}
                                >
                                  {reply.text}
                                </p>
                                <span
                                  className="reply-author"
                                  style={{
                                    color: 'black',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  @{reply.username}
                                </span>
                              </div>
                            </div>

                            <button
                              className="reply-report-btn"
                              onClick={() => reportComment(reply._id)}
                              style={{ marginLeft: '42px' }}
                            >
                              Report
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* REPLY BOX */}
                    {replyBoxVisible === main._id && (
                      <div
                        className="reply-input-wrapper"
                        style={{ marginLeft: '48px' }}
                      >
                        <input
                          className="reply-input"
                          type="text"
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                        />

                        {/* SEND */}
                        <button
                          className="reply-send-btn"
                          onClick={() => sendReply(main._id)}
                        >
                          Send
                        </button>

                        {/* CANCEL - NEW BUTTON */}
                        <button
                          className="reply-cancel-btn"
                          style={{
                            marginLeft: '8px',
                            background: 'transparent',
                            border: '1px solid #666',
                            color: '#ccc',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setReplyBoxVisible(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* NEW COMMENT INPUT */}
            <div className="new-comment-area">
              {showEmoji && (
                <div className="emoji-picker-popup">
                  <EmojiPicker
                    onEmojiClick={emoji => {
                      setCommentText(prev => prev + emoji.emoji);
                      setShowEmoji(false);
                    }}
                    theme="dark"
                  />
                </div>
              )}

              <div className="comment-input-wrapper">
                <button
                  className="emoji-btn"
                  onClick={() => setShowEmoji(!showEmoji)}
                >
                  😃
                </button>

                <input
                  className="comment-input"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />

                <button className="post-btn" onClick={sendComment}>
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
