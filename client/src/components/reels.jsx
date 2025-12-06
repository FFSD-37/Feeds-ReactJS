import { useEffect, useState, useRef } from "react";
import { useUserData } from "./../providers/userData.jsx";
import "./../styles/Reels.css";

const REPORT_OPTIONS = [
  "I just don't like it",
  "Bullying or unwanted contact",
  "Suicide, self-injury or eating disorders",
  "Violence, hate or exploitation",
  "Selling or promoting restricted items",
  "Nudity or sexual activity",
  "Scam, fraud or spam",
  "False information",
];

function normalizeComment(raw) {
  const name = raw.name || raw.username || "unknown";
  const avatarUrl = raw.avatarUrl || raw.avatarUrl || "";
  const text = raw.text || raw.body || "";
  const repliesRaw = raw.replies || raw.reply_array || [];
  const replies = Array.isArray(repliesRaw)
    ? repliesRaw.map((r) => normalizeComment(r))
    : [];
  return { _id: raw._id || raw.id || "", name, avatarUrl, text, replies, raw };
}

export default function Reels() {
  const { userData } = useUserData();
  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [openComments, setOpenComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [reportState, setReportState] = useState({ open: false, postId: null, postType: null });

  const [muted, setMuted] = useState(true);
  const isKids = userData?.type === "Kids";

  const videoRefs = useRef([]);
  const touchStartY = useRef(null);

  // Load emoji picker script once
  useEffect(() => {
    const s = document.createElement("script");
    s.type = "module";
    s.src = "https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js";
    document.body.appendChild(s);
    return () => {
      try { document.body.removeChild(s); } catch {}
    };
  }, []);

  // Fetch reels (backend supplies _liked and _saved via markLikedSaved)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/reels`, { credentials: "include" });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = null; }
        if (!cancelled && data && Array.isArray(data.reels)) {
          setReels(data.reels);
        } else if (!cancelled) {
          setReels([]);
        }
      } catch (err) {
        console.error("Reels fetch error:", err);
        if (!cancelled) setReels([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Auto play/pause
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === activeIndex) {
        v.play().catch(() => {});
      } else {
        try { v.pause(); } catch {}
      }
    });
  }, [activeIndex]);

  // Wheel navigation
  useEffect(() => {
    const wheel = (e) => {
      if (e.deltaY > 0) setActiveIndex((p) => (p + 1 < reels.length ? p + 1 : p));
      else setActiveIndex((p) => (p - 1 >= 0 ? p - 1 : p));
    };
    window.addEventListener("wheel", wheel, { passive: true });
    return () => window.removeEventListener("wheel", wheel);
  }, [reels]);

  // Keyboard nav + Escape handling
  useEffect(() => {
    const keys = (e) => {
      if (e.key === "ArrowDown") setActiveIndex((p) => (p + 1 < reels.length ? p + 1 : p));
      if (e.key === "ArrowUp") setActiveIndex((p) => (p - 1 >= 0 ? p - 1 : p));
      if (e.key === "Escape") {
        setOpenComments(null);
        setMenuOpenId(null);
        setShowEmoji(false);
        setReportState({ open: false, postId: null, postType: null });
        setReplyTo(null);
      }
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [reels]);

  // Load comments for open reel
  useEffect(() => {
    if (!openComments) return;
    const reel = reels.find((r) => r._id === openComments);
    if (!reel) return;
    let cancelled = false;
    const loadComments = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/reelcomments/${openComments}?postType=${reel.postType}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (!cancelled && data && data.success && Array.isArray(data.comments)) {
          setComments(data.comments.map(normalizeComment));
        } else if (!cancelled) {
          setComments([]);
        }
      } catch (err) {
        console.error("Comments fetch error:", err);
        if (!cancelled) setComments([]);
      }
    };
    loadComments();
    return () => { cancelled = true; };
  }, [openComments, reels]);

  // Hook emoji clicks when picker visible
  useEffect(() => {
    if (!showEmoji) return;
    const onEmoji = (e) => setCommentText((p) => p + e.detail.unicode);
    const picker = document.querySelector("#reels-emoji-picker");
    if (picker) picker.addEventListener("emoji-click", onEmoji);
    return () => {
      if (picker) picker.removeEventListener("emoji-click", onEmoji);
    };
  }, [showEmoji]);

  const nextReel = () => setActiveIndex((p) => (p + 1 < reels.length ? p + 1 : p));
  const prevReel = () => setActiveIndex((p) => (p - 1 >= 0 ? p - 1 : p));

  const onTouchStart = (e) => (touchStartY.current = e.touches[0].clientY);
  const onTouchMove = (e) => {
    if (!touchStartY.current) return;
    const diff = touchStartY.current - e.touches[0].clientY;
    if (diff > 60) nextReel();
    if (diff < -60) prevReel();
    touchStartY.current = null;
  };

  const animateHeart = (index) => {
    const el = document.getElementById(`reels-heart-${index}`);
    if (!el) return;
    el.classList.add("reels-show-heart");
    setTimeout(() => el.classList.remove("reels-show-heart"), 600);
  };

  // Toggle like/unlike
  const toggleLike = async (reel, index) => {
    animateHeart(index);
    try {
      if (reel._liked) {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/unlikereel`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: reel._id, postType: reel.postType }),
        });
        const data = await res.json();
        if (data && data.success) {
          setReels((prev) => prev.map((r) => (r._id === reel._id ? { ...r, likes: data.likes, _liked: false } : r)));
        }
      } else {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/likereel`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: reel._id, postType: reel.postType }),
        });
        const data = await res.json();
        if (data && data.success) {
          setReels((prev) => prev.map((r) => (r._id === reel._id ? { ...r, likes: data.likes, _liked: true } : r)));
        }
      }
    } catch (err) {
      console.error("Like toggle error:", err);
    }
  };

  // Toggle save/unsave
  const toggleSave = async (reel) => {
    try {
      if (reel._saved) {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/unsavereel`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: reel._id, postType: reel.postType }),
        });
        const data = await res.json();
        if (data && data.success) {
          setReels((prev) => prev.map((r) => (r._id === reel._id ? { ...r, _saved: false } : r)));
          alert("Unsaved");
        }
      } else {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/savereel`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: reel._id, postType: reel.postType }),
        });
        const data = await res.json();
        if (data && data.success) {
          setReels((prev) => prev.map((r) => (r._id === reel._id ? { ...r, _saved: true } : r)));
          alert("Saved");
        }
      }
    } catch (err) {
      console.error("Save toggle error:", err);
    }
  };

  // Submit a new top-level comment
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !openComments) return;
    const reel = reels.find((r) => r._id === openComments);
    if (!reel) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/commentreel`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: reel._id, postType: reel.postType, text: commentText }),
      });
      const data = await res.json();
      if (data && data.success) {
        const norm = normalizeComment(data.comment);
        setComments((p) => [norm, ...p]);
        setCommentText("");
        setReplyTo(null);
      } else {
        console.error("Comment failed", data);
      }
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  // Submit a reply to a comment
  const handleSubmitReply = async () => {
    if (!commentText.trim() || !replyTo) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/replyreel`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentCommentId: replyTo._id,
          postType: replyTo.raw?.type === "Channel" || replyTo.raw?.type === "channel" ? "channel" : "normal",
          text: commentText,
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        const replyNorm = normalizeComment(data.reply);
        setComments((prev) => prev.map((c) => (c._id === replyTo._id ? { ...c, replies: [...(c.replies || []), replyNorm] } : c)));
        setReplyTo(null);
        setCommentText("");
      } else {
        console.error("Reply failed", data);
      }
    } catch (err) {
      console.error("Reply error:", err);
    }
  };

  const openMenuFor = (id) => setMenuOpenId((prev) => (prev === id ? null : id));

  const doCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch {
      alert("Copy failed");
    }
    setMenuOpenId(null);
  };

  const doShare = async (url) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Feed Reel", url });
      } catch {}
    } else {
      alert("Share not supported. Copy the link instead.");
    }
    setMenuOpenId(null);
  };

  const openReportModal = (postId, postType) => setReportState({ open: true, postId, postType });

  const submitReport = async (reason) => {
    try {
      await fetch(`${import.meta.env.VITE_SERVER_URL}/report_post`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: reportState.postId, postType: reportState.postType, reason }),
      });
      alert("Reported");
    } catch (e) {
      console.error(e);
      alert("Report failed");
    } finally {
      setReportState({ open: false, postId: null, postType: null });
    }
  };

  if (loading) return <div className="reels-loading">Loading...</div>;

  return (
    <div className="reels-container" onTouchStart={onTouchStart} onTouchMove={onTouchMove}>
      {reels.map((reel, i) => {
        const active = i === activeIndex;
        const commentsOpen = openComments === reel._id;
        const menuOpen = menuOpenId === reel._id;
        return (
          <div key={reel._id} className={`reels-slide ${active ? "reels-active" : ""} ${commentsOpen ? "reels-comments-open" : ""}`}>
            <div id={`reels-heart-${i}`} className="reels-heart">❤️</div>

            <video
              ref={(el) => (videoRefs.current[i] = el)}
              className="reels-video"
              src={reel.url}
              muted={muted}
              loop
              playsInline
              onClick={() => setMuted((m) => !m)}
            />

            <div className="reels-sidebar">
              <button
                className="reels-btn"
                onClick={() => toggleLike(reel, i)}
                aria-pressed={!!reel._liked}
                title={reel._liked ? "Unlike" : "Like"}
              >
                {reel._liked ? "❤️" : "🤍"} {reel.likes ?? 0}
              </button>

              {!isKids && (
                <button
                  className="reels-btn"
                  onClick={() => {
                    setOpenComments(reel._id);
                    setMenuOpenId(null);
                  }}
                >
                  💬
                </button>
              )}

              <button
                className="reels-btn"
                onClick={() => toggleSave(reel)}
                title={reel._saved ? "Unsave" : "Save"}
              >
                {reel._saved ? "💾" : "📁"}
              </button>

              <button className="reels-btn" onClick={() => setMuted((m) => !m)}>
                {muted ? "🔇" : "🔊"}
              </button>

              <button className="reels-btn" onClick={() => openMenuFor(reel._id)} aria-expanded={menuOpen}>
                ⋯
              </button>

              {menuOpen && (
                <div className="reels-menu" role="menu">
                  <p onClick={() => doCopy(reel.url)}>Copy Link</p>
                  <p onClick={() => doShare(reel.url)}>Share</p>
                  <p onClick={() => openReportModal(reel._id, reel.postType)}>Report</p>
                  <p onClick={() => setMenuOpenId(null)}>Cancel</p>
                </div>
              )}
            </div>

            <div className="reels-info">
              <p className="reels-author">{reel.postType === "normal" ? "@" + reel.author : "#" + reel.channel}</p>
              <p className="reels-caption">{reel.content}</p>
            </div>

            <div className={`reels-comments-panel ${commentsOpen ? "reels-comments-active" : ""}`}>
              {commentsOpen && (
                <div className="reels-comments-container">
                  <div className="reels-comments-header">
                    <p>Comments</p>
                    <button
                      onClick={() => {
                        setOpenComments(null);
                        setReplyTo(null);
                        setCommentText("");
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div className="reels-comments-list">
                    {comments.length === 0 && <p className="reels-no-comments">No comments yet</p>}
                    {comments.map((c) => (
                      <div key={c._id} className="reels-comment-block">
                        <img src={c.avatarUrl} className="reels-comment-avatar" alt="avatar" />
                        <div className="reels-comment-body">
                          <strong>@{c.name}</strong>
                          <p>{c.text}</p>
                          <span
                            className="reels-reply-btn"
                            onClick={() => {
                              setReplyTo(c);
                              setCommentText("");
                            }}
                          >
                            Reply
                          </span>

                          {c.replies && c.replies.length > 0 && (
                            <div className="reels-replies">
                              {c.replies.map((r) => (
                                <div key={r._id} className="reels-reply-item">
                                  <img src={r.avatarUrl} className="reels-reply-avatar" alt="avatar" />
                                  <div>
                                    <strong>@{r.name}</strong>
                                    <p>{r.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="reels-comment-input-box">
                    {replyTo && (
                      <div className="reels-replying-to">
                        Replying to @{replyTo.name}
                        <span onClick={() => setReplyTo(null)}>×</span>
                      </div>
                    )}

                    <button className="reels-emoji-btn" onClick={() => setShowEmoji((s) => !s)}>
                      😀
                    </button>

                    <input
                      className="reels-comment-input"
                      value={commentText}
                      placeholder="Add a comment..."
                      onChange={(e) => setCommentText(e.target.value)}
                    />

                    <button className="reels-send-btn" onClick={() => (replyTo ? handleSubmitReply() : handleSubmitComment())}>
                      Post
                    </button>
                  </div>

                  {showEmoji && <emoji-picker id="reels-emoji-picker"></emoji-picker>}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {reportState.open && (
        <div className="reels-report-overlay" onClick={() => setReportState({ open: false, postId: null, postType: null })}>
          <div className="reels-report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reels-report-header">
              <span>Report</span>
              <button onClick={() => setReportState({ open: false, postId: null, postType: null })}>×</button>
            </div>
            <p className="reels-report-title">Why are you reporting this post?</p>
            <ul className="reels-report-options">
              {REPORT_OPTIONS.map((opt) => (
                <li key={opt} onClick={() => submitReport(opt)}>
                  {opt}
                  <span>›</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
