import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/kidsHome.css";

function KidsHome() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  const [dropdownPost, setDropdownPost] = useState(null);
  const [reportPostId, setReportPostId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const observerRef = useRef();
  const dropdownRef = useRef();
  const modalRef = useRef();

  // Fetch Kids Posts
  const fetchKidsPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/kidshome?skip=${skip}&limit=6`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (data.success && data.posts.length > 0) {
        setPosts((prev) => {
          const existing = new Set(prev.map((p) => p.id));
          const newOnes = data.posts.filter((p) => !existing.has(p.id));
          return [...prev, ...newOnes];
        });

        setSkip((prev) => prev + data.posts.length);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("❌ Error fetching kids posts:", err);
    } finally {
      setLoading(false);
    }
  }, [skip, hasMore, loading]);

  // Initial load
  useEffect(() => {
    fetchKidsPosts();
  }, []);

  // Infinite Scroll
  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchKidsPosts();
        }
      },
      { threshold: 0.9 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchKidsPosts, loading, hasMore]);

  // Time ago helper
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, sec] of Object.entries(intervals)) {
      const count = Math.floor(seconds / sec);
      if (count >= 1) return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }

    return "just now";
  };

  // Play / Pause Video
  const handleVideoClick = (id) => {
    const video = document.getElementById(`kids_video-${id}`);
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlayingVideoId(id);
    } else {
      video.pause();
      setPlayingVideoId(null);
    }
  };

  // Like Post
  const handleLike = async (postId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/channel/like`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, likes: data.likes, liked: data.liked }
              : p
          )
        );
      }
    } catch (err) {
      console.error("❌ Error liking post:", err);
    }
  };

  // Save Post
  const handleSave = async (postId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/channel/save`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, saved: data.saved } : p
          )
        );
      }
    } catch (err) {
      console.error("❌ Error saving post:", err);
    }
  };

  // Report option
  const handleDropdownToggle = (id) =>
    setDropdownPost((p) => (p === id ? null : id));

  const handleReportClick = (id) => {
    setReportPostId(id);
    setDropdownPost(null);
    setShowReportModal(true);
  };

  const handleCloseReport = () => {
    setShowReportModal(false);
    setReportPostId(null);
  };

  const handleReasonSelect = (reason) => {
    alert(`Reported post ${reportPostId} for: ${reason}`);
    handleCloseReport();
  };

  return (
    <div className="kids_home_main">
      {/* Left Sidebar */}
      <div className="kids_home_left_section">
        <div className="kids_home_logo_class" onClick={() => navigate("/kidshome")}>
          <img
            className="kids_home_logo"
            src="https://ik.imagekit.io/FFSD0037/logo.jpeg?updatedAt=1746701257780"
            alt="Feeds Logo"
          />
        </div>

        <div className="kids_home_footer">
          <a href="/contact">About</a> • <a href="/help">Help</a> •{" "}
          <a href="/tandc">Terms</a> •{" "}
          <a
            href="https://www.google.com/maps/place/IIIT+Sri+City"
            target="_blank"
          >
            Location
          </a>
          <p>
            © 2025 <a href="/home">Feeds</a> from IIIT Sri City
          </p>
        </div>
      </div>

      {/* Feed Section */}
      <div className="kids_home_feed_section">
        <h1 className="kids_home_title">Kids Feeds</h1>
        <div className="kids_home_divider"></div>

        {posts.length === 0 && !loading ? (
          <p className="kids_home_no_posts">No posts available.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="kids_home_post_card">
              {/* Header */}
              <div className="kids_home_post_header">
                <span
                  className="kids_home_post_channel"
                  onClick={() => navigate(`/channel/${post.channel}`)}
                >
                  @{post.channel}
                </span>

                <div
                  className="kids_home_post_menu_trigger"
                  onClick={() => handleDropdownToggle(post.id)}
                >
                  •••
                </div>

                {dropdownPost === post.id && (
                  <div className="kids_home_dropdown_menu" ref={dropdownRef}>
                    <div
                      className="kids_home_dropdown_item danger"
                      onClick={() => handleReportClick(post.id)}
                    >
                      Report
                    </div>
                    <div
                      className="kids_home_dropdown_item"
                      onClick={() => setDropdownPost(null)}
                    >
                      Cancel
                    </div>
                  </div>
                )}
              </div>

              {/* Media */}
              {post.type === "Img" ? (
                <img
                  className="kids_home_post_media"
                  src={post.url}
                  alt="Post"
                />
              ) : (
                <div
                  className="kids_home_video_wrapper"
                  onClick={() => handleVideoClick(post.id)}
                >
                  <video
                    id={`kids_video-${post.id}`}
                    className="kids_home_post_media"
                    src={post.url}
                    muted
                    loop
                    playsInline
                  />
                  {playingVideoId !== post.id && (
                    <div className="kids_home_play_button">▶</div>
                  )}
                </div>
              )}

              {/* Caption */}
              {post.content && (
                <p className="kids_home_post_caption">{post.content}</p>
              )}

              {/* Actions */}
              <div className="kids_home_post_actions">
                <div
                  className="kids_home_action_item"
                  onClick={() => handleLike(post._id)}
                >
                  {post.liked ? "❤️" : "🤍"} {post.likes}
                </div>

                <div
                  className="kids_home_action_item"
                  onClick={() => handleSave(post._id)}
                >
                  {post.saved ? "💾" : "📁"}
                </div>
              </div>

              <div className="kids_home_post_time">
                {timeAgo(post.createdAt)}
              </div>
            </div>
          ))
        )}

        {loading && <p className="kids_home_loading">Loading...</p>}
        {!hasMore && posts.length > 0 && (
          <p className="kids_home_end_text">You're all caught up!</p>
        )}

        <div ref={observerRef}></div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="kids_home_report_overlay">
          <div className="kids_home_report_modal" ref={modalRef}>
            <div className="kids_home_modal_header">
              <span>Report</span>
              <button
                className="kids_home_close_btn"
                onClick={handleCloseReport}
              >
                ×
              </button>
            </div>
            <p className="kids_home_modal_title">
              Why are you reporting this post?
            </p>
            <ul className="kids_home_report_options">
              {[
                "I just don't like it",
                "Bullying or unwanted contact",
                "Violence or hate",
                "Inappropriate content",
                "Spam or scam",
                "False information",
              ].map((reason) => (
                <li key={reason} onClick={() => handleReasonSelect(reason)}>
                  {reason} <span>›</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default KidsHome;
