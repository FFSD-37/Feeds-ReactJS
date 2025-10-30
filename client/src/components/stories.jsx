import React, { useEffect, useMemo, useRef, useState } from "react";
import "./../styles/stories.css";

/**
 * Stories component
 *
 * Props:
 *  - initialStories: optional array of stories preloaded from server
 *      each story: { _id, username, avatarUrl, url, createdAt, liked? }
 *  - currentUser: optional current logged-in username
 *  - fetchUrl: optional url to fetch stories if initialStories not provided (default '/stories')
 */
export default function Stories({
  initialStories = null,
  currentUser = null,
  fetchUrl = "http://localhost:3000/stories",
}) {
  const [stories, setStories] = useState(initialStories || []);
  const [loading, setLoading] = useState(!initialStories);
  const [error, setError] = useState(null);

  // viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeUsername, setActiveUsername] = useState(null);
  const [activeStories, setActiveStories] = useState([]); // stories of active user
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressPercents, setProgressPercents] = useState([]); // per-story percent 0..100
  const [isPaused, setIsPaused] = useState(false);

  const progressIntervalRef = useRef(null);
  const storyMediaRefs = useRef({}); // store refs by index for media elements
  const defaultDuration = 5000; // ms for images or fallback
  const [progressDuration, setProgressDuration] = useState(defaultDuration);

  // Build a map of username -> list of stories
  const usersMap = useMemo(() => {
    const m = {};
    (stories || []).forEach((s) => {
      const u = s.username;
      if (!m[u]) m[u] = { username: u, avatar: s.avatarUrl, stories: [] };
      m[u].stories.push(s);
    });
    Object.values(m).forEach((obj) =>
      obj.stories.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    );
    return m;
  }, [stories]);

  const usernamesOrdered = useMemo(() => Object.keys(usersMap), [usersMap]);

  useEffect(() => {
    if (!initialStories) {
      setLoading(true);
      fetch(fetchUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const payload = data.allStories || data.stories || data;
          setStories(Array.isArray(payload) ? payload : []);
        })
        .catch((err) => {
          console.error("Stories fetch failed:", err);
          setError("Could not load stories");
        })
        .finally(() => setLoading(false));
    }
  }, [initialStories, fetchUrl]);

  // Open viewer for a username
  function openStory(username) {
    const arr = usersMap[username]?.stories || [];
    if (!arr.length) return;
    setActiveUsername(username);
    setActiveStories(arr);
    setActiveIndex(0);
    setProgressPercents(new Array(arr.length).fill(0));
    setViewerOpen(true);
    setIsPaused(false);
    setProgressDuration(defaultDuration);
    setTimeout(() => startProgress(0), 50);
  }

  function closeStory() {
    stopProgress();
    setViewerOpen(false);
    setActiveUsername(null);
    setActiveStories([]);
    setActiveIndex(0);
    storyMediaRefs.current = {};
  }

  function startProgress(index) {
    stopProgress();
    setProgressPercents((prev) => {
      const next = prev.slice(0, activeStories.length).map((v, i) => (i < index ? 100 : 0));
      while (next.length < activeStories.length) next.push(0);
      return next;
    });

    const mediaEl = storyMediaRefs.current[index];
    let duration = defaultDuration;
    if (mediaEl && mediaEl.tagName === "VIDEO" && mediaEl.duration && !Number.isNaN(mediaEl.duration)) {
      duration = Math.min(Math.max(mediaEl.duration * 1000, 2000), 30000);
    } else {
      duration = defaultDuration;
    }
    setProgressDuration(duration);

    const stepMs = Math.max(30, Math.round(duration / 200));
    let width = 0;
    progressIntervalRef.current = setInterval(() => {
      if (isPaused) return;
      width += 100 / (duration / stepMs);
      if (width >= 100) {
        setProgressPercents((prev) => {
          const updated = prev.slice();
          updated[index] = 100;
          return updated;
        });
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
        setTimeout(() => nextStory(), 120);
      } else {
        setProgressPercents((prev) => {
          const next = prev.slice();
          next[index] = Math.min(100, width);
          return next;
        });
      }
    }, stepMs);
  }

  function stopProgress() {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }

  function pauseProgress() {
    setIsPaused(true);
    stopProgress();
    const media = storyMediaRefs.current[activeIndex];
    if (media && media.tagName === "VIDEO") {
      try { media.pause(); } catch (e) {}
    }
  }

  function resumeProgress() {
    setIsPaused(false);
    const media = storyMediaRefs.current[activeIndex];
    if (media && media.tagName === "VIDEO") {
      media.play().catch(() => {});
    }
    startProgress(activeIndex);
  }

  function showStoryAt(index) {
    if (index < 0 || index >= activeStories.length) return;
    const prevMedia = storyMediaRefs.current[activeIndex];
    if (prevMedia && prevMedia.tagName === "VIDEO") {
      try { prevMedia.pause(); } catch (e) {}
    }
    setActiveIndex(index);
    setProgressPercents((prev) => {
      const next = prev.slice();
      for (let i = 0; i < next.length; i++) {
        next[i] = i < index ? 100 : 0;
      }
      return next;
    });
    setTimeout(() => startProgress(index), 50);
    setIsPaused(false);
  }

  function nextStory() {
    if (activeIndex < activeStories.length - 1) {
      showStoryAt(activeIndex + 1);
    } else {
      const userList = usernamesOrdered;
      const currentUserIndex = userList.indexOf(activeUsername);
      if (currentUserIndex >= 0 && currentUserIndex < userList.length - 1) {
        openStory(userList[currentUserIndex + 1]);
      } else {
        closeStory();
      }
    }
  }

  function previousStory() {
    if (activeIndex > 0) {
      showStoryAt(activeIndex - 1);
    } else {
      const userList = usernamesOrdered;
      const currentUserIndex = userList.indexOf(activeUsername);
      if (currentUserIndex > 0) {
        const prevUser = userList[currentUserIndex - 1];
        openStory(prevUser);
        setTimeout(() => {
          const len = (usersMap[prevUser]?.stories || []).length;
          if (len > 0) showStoryAt(len - 1);
        }, 100);
      } else {
        closeStory();
      }
    }
  }

  function handleMediaClick() {
    const media = storyMediaRefs.current[activeIndex];
    if (!media) return;
    if (media.tagName === "VIDEO") {
      if (media.paused) {
        media.play().catch(() => {});
        resumeProgress();
      } else {
        media.pause();
        pauseProgress();
      }
    } else {
      if (isPaused) resumeProgress(); else pauseProgress();
    }
  }

  async function toggleLike(storyId, currentlyLiked, setLocalLiked) {
    setLocalLiked(!currentlyLiked);
    try {
      const res = await fetch(`/stories/liked/${storyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Like API error");
      const data = await res.json();
      const final = typeof data.liked !== "undefined" ? !!data.liked : !currentlyLiked;
      setStories((prev) => prev.map((s) => (s._id === storyId ? { ...s, liked: final } : s)));
      setLocalLiked(final);
    } catch (err) {
      console.error("Like toggle failed", err);
      setLocalLiked(currentlyLiked);
    }
  }

  useEffect(() => {
    function onKey(e) {
      if (!viewerOpen) return;
      if (e.key === "ArrowRight") nextStory();
      else if (e.key === "ArrowLeft") previousStory();
      else if (e.key === "Escape") closeStory();
      else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (isPaused) resumeProgress(); else pauseProgress();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen, isPaused, activeIndex, activeStories, activeUsername, usersMap]);

  useEffect(() => () => stopProgress(), []);

  function attachMediaRef(index, el) {
    if (!el) return;
    storyMediaRefs.current[index] = el;
    if (el.tagName === "VIDEO") {
      el.addEventListener("loadedmetadata", () => {
        if (index === activeIndex) {
          stopProgress();
          startProgress(index);
        }
      });
      el.addEventListener("play", () => setIsPaused(false));
      el.addEventListener("pause", () => setIsPaused(true));
    }
  }

  const uniqueUsers = useMemo(() => Object.values(usersMap).map((u) => ({ username: u.username, avatar: u.avatar })), [usersMap]);

  // Small inline SVG spinner used while buffering / loading
  const Spinner = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width="48" height="48" viewBox="0 0 50 50" aria-hidden>
        <circle cx="25" cy="25" r="20" fill="none" stroke="#ddd" strokeWidth="5" />
        <path fill="#667eea" d="M25 5 A20 20 0 0 1 45 25 L40 25 A15 15 0 0 0 25 10z">
          <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
        </path>
      </svg>
      <div style={{ color: "#fff", opacity: 0.9 }}>Loading...</div>
    </div>
  );

  const NoStories = () => (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 48, opacity: 0.6 }}>🙁</div>
      <div style={{ marginTop: 12, fontSize: 18, color: "#fff" }}>No stories found</div>
      <div style={{ marginTop: 6, color: "#e6e6e6" }}>Try again later or ask users to post stories.</div>
    </div>
  );

  return (
    <div className="stories-page" style={{ padding: 16 }}>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
          <Spinner />
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", color: "crimson", padding: 20 }}>{error}</div>
      ) : uniqueUsers.length === 0 ? (
        <NoStories />
      ) : (
        <>
          <div className="stories-grid" id="stories-grid">
            {uniqueUsers.map((user) => (
              <div
                key={user.username}
                className="story-container"
                onClick={() => openStory(user.username)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openStory(user.username);
                }}
              >
                <div className={`story-avatar-border`}>
                  <img src={user.avatar || "/api/placeholder/80/80"} alt={user.username} className="story-avatar" />
                </div>
                <div className="story-username">{user.username}</div>
              </div>
            ))}
          </div>

          {/* Viewer Modal */}
          <div className="story-viewer" id="story-viewer" style={{ display: viewerOpen ? "block" : "none" }} aria-hidden={!viewerOpen}>
            <div className="close-story" onClick={closeStory} role="button" aria-label="Close story">
              ✕
            </div>

            <div className="story-progress" id="story-progress-container" aria-hidden>
              {(activeStories || []).map((s, i) => (
                <div className="progress-bar" key={s._id || i}>
                  <div className="progress-bar-fill" id={`progress-${i}`} style={{ width: `${progressPercents[i] || 0}%` }} />
                </div>
              ))}
            </div>

            <div className="story-header">
              <div className="user-info" id="story-user-info">
                <img src={activeStories[0]?.avatarUrl || "/api/placeholder/64/64"} alt={activeUsername} className="user-avatar-small" />
                <span className="username" id="story-username">{activeUsername}</span>
                <span className="post-time" id="story-time">
                  {activeStories[activeIndex] ? new Date(activeStories[activeIndex].createdAt).toLocaleString() : ""}
                </span>
              </div>
              <div className="story-actions" style={{ display: "flex", gap: 8 }} />
            </div>

            <div className="story-view" id="story-view-container" onClick={handleMediaClick}>
              {(activeStories || []).map((story, i) => {
                const isActive = i === activeIndex;
                const type = story.url && story.url.toLowerCase().includes(".mp4") ? "video" : "image";
                return (
                  <div key={story._id || i} id={`story-image-${i}`} className={`story-image ${isActive ? "active-story" : "inactive-story"}`} style={{ display: isActive ? "block" : "none" }}>
                    <div className="story-media-container" style={{ width: "100%", height: "100%" }}>
                      {type === "image" ? (
                        <img
                          src={story.url}
                          alt={`Story ${i}`}
                          className="story-media"
                          ref={(el) => {
                            if (isActive) attachMediaRef(i, el);
                            else {
                              storyMediaRefs.current[i] = storyMediaRefs.current[i] || null;
                            }
                          }}
                        />
                      ) : (
                        <video src={story.url} className="story-media" ref={(el) => attachMediaRef(i, el)} playsInline muted autoPlay={isActive} />
                      )}

                      <StoryLikeButton story={story} onToggle={(setLocal) => toggleLike(story._id || story.id, !!story.liked, setLocal)} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="navigation">
              <div className="nav-left" onClick={(e) => { e.stopPropagation(); previousStory(); }} />
              <div className="nav-right" onClick={(e) => { e.stopPropagation(); nextStory(); }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* Subcomponent for the like button (keeps component tidy) */
function StoryLikeButton({ story, onToggle }) {
  const [liked, setLiked] = useState(!!story.liked);
  useEffect(() => setLiked(!!story.liked), [story.liked]);

  return (
    <button className={`story-like-button ${liked ? "liked" : ""}`} type="button" aria-pressed={liked} title={liked ? "Liked" : "Like"} onClick={(e) => { e.stopPropagation(); onToggle(setLiked); }}>
      <svg viewBox="0 0 24 24" className="heart-icon" width="20" height="20" aria-hidden="true" focusable="false">
        <path className="heart-outline" d="M12.1 8.64l-.1.1-.11-.11C10.14 6.7 7.35 6.7 5.8 8.25 4.23 9.82 4.23 12.6 5.8 14.17L12 20.36l6.2-6.19c1.57-1.57 1.57-4.35 0-5.92-1.55-1.55-4.34-1.55-5.9 0z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path className="heart-filled" d="M12 21s-7.5-5.5-9-8.4C1.9 9.1 4 6 7 6c1.7 0 3 1 4 2.3C12.9 7 14.3 6 16 6c3 0 5.1 3.1 4 6.6-1.5 2.9-9 8.4-9 8.4z" fill="currentColor" opacity={liked ? 1 : 0} />
      </svg>
    </button>
  );
}
