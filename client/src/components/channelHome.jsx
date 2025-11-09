import React, { useEffect, useState, useRef, useCallback } from "react";
import { useUserData } from "./../providers/userData.jsx";
import "./../styles/channelHome.css";

function ChannelHome() {
  const { userData } = useUserData();
  const [posts, setPosts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/getAllChannelPosts?skip=${skip}&limit=5`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (data.success) {
        setPosts((prev) => [...prev, ...data.posts]);
        setHasMore(data.hasMore);
        setSkip((prev) => prev + 5);
      } else {
        console.warn("⚠️", data.message);
        setHasMore(false);
      }
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [skip, hasMore, loading]);

  useEffect(() => {
    fetchPosts(); // initial load
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchPosts();
      },
      { threshold: 0.9 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchPosts, loading, hasMore]);

  return (
    <div className="channel_home_container">
      <div className="channel_home_header">
        <img
          src={userData.profileUrl || "/Images/default_user.jpeg"}
          alt="Channel Logo"
          className="channel_home_logo"
        />
        <div className="channel_home_info">
          <h2>{userData.channelName}</h2>
          <p>Managed by @{userData.adminName}</p>
        </div>
      </div>

      <h3 className="channel_home_title">Channel Feed</h3>

      <div className="channel_home_grid">
        {posts.length > 0 ? (
          posts.map((post, i) => (
            <div key={post.id || i} className="channel_home_card">
              {post.type === "Img" ? (
                <img src={post.url} alt="Post" className="channel_home_img" />
              ) : (
                <video
                  src={post.url}
                  className="channel_home_video"
                  controls
                  muted
                  playsInline
                />
              )}
              <div className="channel_home_content">
                <p>{post.content}</p>
                <div className="channel_home_meta">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments?.length || 0}</span>
                  <span>
                    📅 {new Date(post.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading && <p className="channel_home_empty">No posts yet</p>
        )}
      </div>

      {loading && <p className="channel_home_loading">Loading more posts...</p>}
      {!hasMore && posts.length > 0 && (
        <p className="channel_home_end">No more posts to show</p>
      )}

      <div ref={observerRef}></div>
    </div>
  );
}

export default ChannelHome;
