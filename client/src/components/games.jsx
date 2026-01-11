import { useState } from "react";
import "./../styles/games.css";

/*
ISSUES/Improvements:
1. Do something about Motocross video quality.
2. Add more games to the list.
3. Implement pagination or infinite scroll for better performance with many games.
4. Add a "No results found" message when the search yields no games.
5. Consider adding categories or filters for better game discovery.
*/

export default function Games() {
  const [searchTerm, setSearchTerm] = useState("");

  const games = [
    {
      title: "Happy Glass",
      img: "https://ik.imagekit.io/FFSD0037/games/happy_glass.png?updatedAt=1741718023335",
      video: "https://ik.imagekit.io/FFSD0037/games/happy_glass.mp4?updatedAt=1741718023985",
      link: "https://poki.com/en/g/happy-glass",
      featured: true,
    },
    {
      title: "Motocross Game",
      img: "https://ik.imagekit.io/FFSD0037/games/motocross.avif?updatedAt=1741718023338",
      video: "https://ik.imagekit.io/FFSD0037/games/motocross_v.mp4?updatedAt=1742760608997",
      link: "https://poki.com/en/g/stunt-bike-extreme",
      featured: true,
    },
    {
      title: "Subway Surfers",
      img: "https://ik.imagekit.io/FFSD0037/games/subway_surfer.jpg?updatedAt=1741718027587",
      video: "https://ik.imagekit.io/FFSD0037/games/subway_surfer_v.mp4?updatedAt=1741718029880",
      link: "https://poki.com/en/g/subway-surfers",
      featured: true,
    },
    {
      title: "Stupid Zombie",
      img: "https://ik.imagekit.io/FFSD0037/games/zombie.avif?updatedAt=1741718027948",
      video: "https://ik.imagekit.io/FFSD0037/games/zombie.mp4?updatedAt=1741718028933",
      link: "https://poki.com/en/g/stupid-zombies",
    },
    {
      title: "Pool Game",
      img: "https://ik.imagekit.io/FFSD0037/games/pool.avif?updatedAt=1741718023343",
      video: "https://ik.imagekit.io/FFSD0037/games/pool.mp4?updatedAt=1741718024967",
      link: "https://poki.com/en/g/pool-club",
    },
    {
      title: "Chess Game",
      img: "https://ik.imagekit.io/FFSD0037/games/chess.avif?updatedAt=1741718023263",
      video: "https://ik.imagekit.io/FFSD0037/games/chess.mp4?updatedAt=1741718024858",
      link: "https://poki.com/en/g/master-chess",
    },
    {
      title: "Puzzle Game",
      img: "https://ik.imagekit.io/FFSD0037/games/puzzle.avif?updatedAt=1741718023311",
      video: "https://ik.imagekit.io/FFSD0037/games/puzzle.mp4?updatedAt=1741718024413",
      link: "https://poki.com/en/g/blocky-blast-puzzle",
    },
  ];

  const filteredGames = games.filter((g) =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="games_page">
      <div className="games_header">
        <div className="games_logo">
          <a href="/home">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e8eaed"
            >
              <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
            </svg>
          </a>
        </div>

        <input
          type="text"
          className="games_search-box"
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="games_game-grid">
        {filteredGames.map((game, index) => (
          <div
            key={index}
            className={`games_game-card ${game.featured ? "games_featured" : ""}`}
            onClick={() => window.open(game.link, "_blank")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={(e) =>
              setTimeout(() => {
                e.currentTarget.style.transform = "translateY(-5px)";
              }, 150)
            }
            onMouseEnter={(e) => {
              const vid = e.currentTarget.querySelector("video");
              if (vid) vid.play();
            }}
            onMouseLeave={(e) => {
              const vid = e.currentTarget.querySelector("video");
              if (vid) {
                vid.pause();
                vid.currentTime = 0;
              }
            }}
          >
            <img src={game.img} alt={game.title} />
            <video loop muted preload="none">
              <source src={game.video} type="video/mp4" />
            </video>
            <div className="games_game-title">{game.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
