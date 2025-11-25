import React, { useState } from "react";
import "../styles/Reels.css";

const DEMO_REELS = [
  {
    id: 1,
    user: "Kavya",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    caption: "Such a beautiful day!",
    type: "Normal",
  },
  {
    id: 2,
    user: "Aarav (Kids)",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    caption: "Time for kids fun!",
    type: "Kids",
  },
  {
    id: 3,
    user: "ChannelX",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    caption: "ChannelX exclusive content!",
    type: "Channel",
  },
];

const FILTERS = ["All", "Normal", "Kids", "Channel"];

const Reels = () => {
  const [filter, setFilter] = useState("All");
  const reels = filter === "All"
    ? DEMO_REELS
    : DEMO_REELS.filter(r => r.type === filter);

  return (
    <main className="reels-card">
      <h1 className="reels-title">Reels</h1>
      <nav className="reels-tabs">
        {FILTERS.map((tab) => (
          <button
            key={tab}
            className={filter === tab ? "reels-tab active" : "reels-tab"}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
      <div className="reels-list">
        {reels.map(reel => (
          <section className="reel-item" key={reel.id}>
            <div className="reel-meta">
              <span className="reel-user">{reel.user}</span>
              <span className="reel-type">{reel.type}</span>
            </div>
            <video controls src={reel.videoUrl} className="reel-video" />
            <p className="reel-caption">{reel.caption}</p>
          </section>
        ))}
        {reels.length === 0 && <div className="reels-muted">No reels in this category.</div>}
      </div>
    </main>
  );
};
export default Reels;