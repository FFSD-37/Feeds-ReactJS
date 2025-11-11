import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/channelPostOverlay.css';

export default function ChannelPostOverlay({ id, onClose }) {
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false); // ✅ new
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src =
      'https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js';
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const picker = document.querySelector('#channel-post-overlay-emoji-picker');
    if (picker) {
      picker.addEventListener('emoji-click', e => {
        setNewComment(prev => prev + e.detail.unicode);
      });
    }
  }, [showEmoji]);

  useEffect(() => {
    const handleEsc = e => {
      if (e.key !== 'Escape') return;

      // Step 1: Close emoji picker first
      if (showEmoji) {
        setShowEmoji(false);
        e.stopPropagation();
        return;
      }

      // Step 2: Close report modal next
      if (showReportModal) {
        setShowReportModal(false);
        e.stopPropagation();
        return;
      }

      // Step 3: Finally close the overlay itself
      onClose();
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showEmoji, showReportModal, onClose]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_SERVER_URL}/channelPost/${id}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPost(data.post);
          setComments(data.comments);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/channel/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ postId: post._id }),
    });
    const data = await res.json();
    if (data.success) setPost(prev => ({ ...prev, likes: data.likes }));
  };

  const handleSave = async () => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/channel/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ postId: post._id }),
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/channel/comment`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId: post._id,
          text: newComment,
          parentCommentId: replyTo?._id || null,
        }),
      },
    );
    const data = await res.json();
    if (data.success) {
      if (replyTo) {
        setComments(prev =>
          prev.map(c =>
            c._id === replyTo._id
              ? { ...c, replies: [...(c.replies || []), data.comment] }
              : c,
          ),
        );
        setReplyTo(null);
      } else {
        setComments(prev => [data.comment, ...prev]);
      }
      setNewComment('');
    }
  };

  // ✅ Show the report modal instead of alert
  const handleReport = () => {
    setShowReportModal(true);
    setShowOptions(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Post link copied!');
    setShowOptions(false);
  };

  const handleShare = () => {
    navigator.share
      ? navigator.share({ title: 'Feeds Post', url: window.location.href })
      : alert('Copy URL to share manually.');
    setShowOptions(false);
  };

  const handleCloseReport = () => {
    setShowReportModal(false);
  };

  const handleReasonSelect = reason => {
    // API call can be added here
    alert(`Reported post for: ${reason}`);
    setShowReportModal(false);
  };

  if (loading)
    return (
      <div className="channel-post-overlay-container">
        <div className="channel-post-overlay-loader">Loading...</div>
      </div>
    );

  if (!post)
    return (
      <div className="channel-post-overlay-container">
        <div className="channel-post-overlay-content">
          <p>Post not found.</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );

  return (
    <>
      <div className="channel-post-overlay-container" onClick={onClose}>
        <div
          className="channel-post-overlay-wrapper"
          onClick={e => e.stopPropagation()}
        >
          {/* LEFT SIDE */}
          <div className="channel-post-overlay-left">
            <div className="channel-post-overlay-header">
              <span
                onClick={() => navigate(`/channel/${post.channel}`)}
                className="channel-post-overlay-channel"
              >
                @{post.channel}
              </span>
              <div className="channel-post-overlay-options">
                <button onClick={() => setShowOptions(p => !p)}>⋯</button>
                {showOptions && (
                  <div className="channel-post-overlay-dropdown">
                    <div onClick={handleReport}>Report</div>
                    <div onClick={handleShare}>Share to...</div>
                    <div onClick={handleCopy}>Copy link</div>
                    <div onClick={() => navigate(`/channel/${post.channel}`)}>
                      Go to channel
                    </div>
                    <div onClick={() => setShowOptions(false)}>Cancel</div>
                  </div>
                )}
              </div>
            </div>

            {post.type === 'Img' ? (
              <img
                src={post.url}
                alt="Post"
                className="channel-post-overlay-image"
              />
            ) : (
              <video
                src={post.url}
                className="channel-post-overlay-image"
                controls
                autoPlay
                loop
                playsInline
              />
            )}

            <div className="channel-post-overlay-actions">
              <button onClick={handleLike}>❤️ {post.likes}</button>
              <button onClick={() => setShowEmoji(!showEmoji)}>💬</button>
              <button onClick={handleSave}>💾</button>
              <button onClick={handleShare}>🔗</button>
            </div>

            <div className="channel-post-overlay-caption">{post.content}</div>
          </div>

          {/* RIGHT SIDE */}
          <div className="channel-post-overlay-right">
            <div className="channel-post-overlay-comments">
              {comments.length === 0 ? (
                <p className="channel-post-overlay-empty">No comments yet</p>
              ) : (
                comments.map(c => (
                  <div
                    key={c._id}
                    className="channel-post-overlay-comment-item"
                  >
                    <img
                      src={c.avatarUrl}
                      alt="avatar"
                      onClick={() =>
                        c.type === 'Channel'
                          ? navigate(`/channel/${c.name}`)
                          : navigate(`/profile/${c.name}`)
                      }
                    />
                    <div>
                      <strong
                        onClick={() =>
                          c.type === 'Channel'
                            ? navigate(`/channel/${c.name}`)
                            : navigate(`/profile/${c.name}`)
                        }
                      >
                        @{c.name}
                      </strong>
                      <p>{c.text}</p>
                      <span
                        className="channel-post-overlay-reply"
                        onClick={() => setReplyTo(c)}
                      >
                        Reply
                      </span>

                      {/* Replies */}
                      {c.replies?.length > 0 && (
                        <div className="channel-post-overlay-replies">
                          {c.replies.map(r => (
                            <div
                              key={r._id}
                              className="channel-post-overlay-reply-item"
                            >
                              <img
                                src={r.avatarUrl}
                                alt="avatar"
                                onClick={() =>
                                  r.type === 'Channel'
                                    ? navigate(`/channel/${r.name}`)
                                    : navigate(`/profile/${r.name}`)
                                }
                              />
                              <strong
                                onClick={() =>
                                  r.type === 'Channel'
                                    ? navigate(`/channel/${r.name}`)
                                    : navigate(`/profile/${r.name}`)
                                }
                              >
                                @{r.name}
                              </strong>
                              <p>{r.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="channel-post-overlay-add-comment">
              {replyTo && (
                <div className="channel-post-overlay-replying-to">
                  Replying to @{replyTo.name}{' '}
                  <span onClick={() => setReplyTo(null)}>×</span>
                </div>
              )}
              <button
                id="channel-post-overlay-emoji-btn"
                onClick={() => setShowEmoji(prev => !prev)}
                className="channel-post-overlay-emoji-button"
              >
                😀
              </button>
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="channel-post-overlay-comment-input"
              />
              <button
                onClick={handleAddComment}
                className="channel-post-overlay-post-button"
              >
                Post
              </button>
            </div>

            {showEmoji && (
              <emoji-picker
                id="channel-post-overlay-emoji-picker"
                style={{
                  position: 'absolute',
                  bottom: '70px',
                  right: '20px',
                  opacity: showEmoji ? '1' : '0',
                  transform: showEmoji ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.3s ease',
                  zIndex: 1000,
                }}
              ></emoji-picker>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Report Modal Overlay (above post overlay) */}
      {showReportModal && (
        <div className="channel-post-overlay-report-overlay">
          <div className="channel-post-overlay-report-modal">
            <div className="channel_home_modal_header">
              <span>Report</span>
              <button
                className="channel_home_close_btn"
                onClick={handleCloseReport}
              >
                ×
              </button>
            </div>
            <p className="channel_home_modal_title">
              Why are you reporting this post?
            </p>
            <ul className="channel_home_report_options">
              {[
                "I just don't like it",
                'Bullying or unwanted contact',
                'Suicide, self-injury or eating disorders',
                'Violence, hate or exploitation',
                'Selling or promoting restricted items',
                'Nudity or sexual activity',
                'Scam, fraud or spam',
                'False information',
              ].map(reason => (
                <li key={reason} onClick={() => handleReasonSelect(reason)}>
                  {reason} <span>›</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
