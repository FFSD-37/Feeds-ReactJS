import React, { useEffect, useMemo, useRef, useState } from "react";
import "./../styles/stories.css";

/**
 * Stories component
 * Professional UI Overhaul
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
  const [activeStories, setActiveStories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressPercents, setProgressPercents] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  const progressIntervalRef = useRef(null);
  const storyMediaRefs = useRef({});
  const defaultDuration = 5000;
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
        headers: { Accept: "application/json" },
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

  // Professional Apple-style Spinner
  const Spinner = () => (
    <div className="stories-spinner-container">
      <svg className="stories-spinner" viewBox="0 0 50 50">
        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
      </svg>
      <span className="loading-text">Updating feed...</span>
    </div>
  );

  const NoStories = () => (
    <div className="no-stories-container">
      <div className="no-stories-icon">😴</div>
      <h3>All caught up</h3>
      <p>No stories available at the moment.</p>
    </div>
  );

  return (
    <div className="stories-wrapper">
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="stories-error">{error}</div>
      ) : uniqueUsers.length === 0 ? (
        <NoStories />
      ) : (
        <>
          <div className="stories-tray">
            {uniqueUsers.map((user) => (
              <button
                key={user.username}
                className="story-trigger"
                onClick={() => openStory(user.username)}
                aria-label={`View story by ${user.username}`}
              >
                <div className="avatar-ring">
                  <div className="avatar-gap">
                    <img 
                      src={user.avatar || "/api/placeholder/80/80"} 
                      alt="" 
                      className="tray-avatar" 
                    />
                  </div>
                </div>
                <span className="tray-username">{user.username}</span>
              </button>
            ))}
          </div>

          {/* Viewer Overlay */}
          <div className={`story-overlay ${viewerOpen ? "open" : ""}`} aria-hidden={!viewerOpen}>
            <div className="story-backdrop" onClick={closeStory}></div>
            
            <div className="story-modal">
              {viewerOpen && (
                <>
                  <div className="progress-container">
                    {(activeStories || []).map((s, i) => (
                      <div className="progress-track" key={s._id || i}>
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progressPercents[i] || 0}%` }} 
                        />
                      </div>
                    ))}
                  </div>

                  <div className="modal-header">
                    <div className="header-left">
                      <img 
                        src={activeStories[0]?.avatarUrl || "/api/placeholder/64/64"} 
                        alt="" 
                        className="header-avatar" 
                      />
                      <div className="header-text">
                        <span className="header-username">{activeUsername}</span>
                        <span className="header-time">
                          {activeStories[activeIndex] ? new Date(activeStories[activeIndex].createdAt).toLocaleString(undefined, { hour: 'numeric', minute: 'numeric' }) : ""}
                        </span>
                      </div>
                    </div>
                    
                    <button className="close-btn" onClick={closeStory} aria-label="Close">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>

                  {/* Navigation Click Areas */}
                  <div className="nav-area left" onClick={(e) => { e.stopPropagation(); previousStory(); }}></div>
                  <div className="nav-area right" onClick={(e) => { e.stopPropagation(); nextStory(); }}></div>

                  <div className="media-stage" onClick={handleMediaClick}>
                    {(activeStories || []).map((story, i) => {
                      const isActive = i === activeIndex;
                      const type = story.url && story.url.toLowerCase().includes(".mp4") ? "video" : "image";
                      return (
                        <div 
                          key={story._id || i} 
                          className={`media-slide ${isActive ? "active" : ""}`}
                        >
                          {type === "image" ? (
                            <img
                              src={story.url}
                              alt=""
                              className="story-content"
                              ref={(el) => {
                                if (isActive) attachMediaRef(i, el);
                                else storyMediaRefs.current[i] = storyMediaRefs.current[i] || null;
                              }}
                            />
                          ) : (
                            <video 
                              src={story.url} 
                              className="story-content" 
                              ref={(el) => attachMediaRef(i, el)} 
                              playsInline 
                              muted 
                              autoPlay={isActive} 
                            />
                          )}
                          
                          <StoryLikeButton 
                            story={story} 
                            onToggle={(setLocal) => toggleLike(story._id || story.id, !!story.liked, setLocal)} 
                          />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* Subcomponent for the like button */
function StoryLikeButton({ story, onToggle }) {
  const [liked, setLiked] = useState(!!story.liked);
  useEffect(() => setLiked(!!story.liked), [story.liked]);

  return (
    <button 
      className={`glass-like-btn ${liked ? "is-liked" : ""}`} 
      type="button" 
      onClick={(e) => { e.stopPropagation(); onToggle(setLiked); }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path className="heart-path" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
}