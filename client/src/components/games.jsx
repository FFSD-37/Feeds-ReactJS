export default function Games(){
    return (
        <>
            <div class="games_header">
                <div class="games_logo">
                    <a href="/home"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" /></svg></a>
                </div>
                <input type="text" class="games_search-box" placeholder="Search games..." />
            </div>
            <div class="games_game-grid">
                <div class="games_game-card games_featured" data-game="Happy Glass" onclick="window.open('https://poki.com/en/g/happy-glass', '_blank')">
                    <img src="https://ik.imagekit.io/FFSD0037/games/happy_glass.png?updatedAt=1741718023335" alt="Happy Glass" />
                        <video loop muted preload="none">
                            <source src="https://ik.imagekit.io/FFSD0037/games/happy_glass.mp4?updatedAt=1741718023985" type="video/mp4" />
                        </video>
                        <div class="games_game-title">Happy Glass</div>
                </div>
                <div class="games_game-card games_featured" data-game="Motocross" onclick="window.open('https://poki.com/en/g/stunt-bike-extreme', '_blank')">
                    <img src="https://ik.imagekit.io/FFSD0037/games/motocross.avif?updatedAt=1741718023338" alt="Motocross Game" />
                        <video loop muted preload="none">
                            <source src="https://ik.imagekit.io/FFSD0037/games/motocross_v.mp4?updatedAt=1742760608997" type="video/mp4" />
                        </video>
                        <div class="games_game-title">Motocross Game</div>
                </div>
                <div class="games_game-card games_featured" data-game="Subway" onclick="window.open('https://poki.com/en/g/subway-surfers', '_blank')">
                    <img src="https://ik.imagekit.io/FFSD0037/games/subway_surfer.jpg?updatedAt=1741718027587" alt="Subway Surfers"/>
                        <video loop muted preload="none">
                            <source src="https://ik.imagekit.io/FFSD0037/games/subway_surfer_v.mp4?updatedAt=1741718029880" type="video/mp4"/>
                        </video>
                        <div class="games_game-title">Subway Surfers</div>
                </div>

                <div class="games_game-card" data-game="Stupid Zombie" onclick="window.open('https://poki.com/en/g/stupid-zombies', '_blank')">
                    <img src="https://ik.imagekit.io/FFSD0037/games/zombie.avif?updatedAt=1741718027948" alt="Monster Game" />
                        <video loop muted preload="none">
                            <source src="https://ik.imagekit.io/FFSD0037/games/zombie.mp4?updatedAt=1741718028933" type="video/mp4" />
                        </video>
                        <div class="games_game-title">Stupid Zombie</div>
                </div>
                <div class="games_game-card" data-game="Pool" onclick="window.open('https://poki.com/en/g/pool-club', '_blank')">
                    <img src="https://ik.imagekit.io/FFSD0037/games/pool.avif?updatedAt=1741718023343" alt="Pool Game" />
                        <video loop muted preload="none">
                            <source src="https://ik.imagekit.io/FFSD0037/games/pool.mp4?updatedAt=1741718024967" type="video/mp4" />
                        </video>
                        <div class="games_game-title">Pool Game</div>
                </div>
                <div class="games_game-card" data-game="Master chess" onclick="window.open('https://poki.com/en/g/master-chess', '_blank')">
                    <img src="https://ik.imagekit.io/FFSD0037/games/chess.avif?updatedAt=1741718023263" alt="Chess Game" />
                        <video loop muted preload="none">
                            <source src="https://ik.imagekit.io/FFSD0037/games/chess.mp4?updatedAt=1741718024858" type="video/mp4" />
                        </video>
                        <div class="games_game-title">Chess Game</div>
                </div>
                <div class="games_game-card" data-game="Puzzle" onclick="window.open('https://poki.com/en/g/blocky-blast-puzzle', '_blank')">
                    <img src="https://ik.imagekit.io/FFSD0037/games/puzzle.avif?updatedAt=1741718023311" alt="Puzzle Game" />
                        <video loop muted preload="none">
                            <source src="https://ik.imagekit.io/FFSD0037/games/puzzle.mp4?updatedAt=1741718024413" type="video/mp4" />
                        </video>
                        <div class="games_game-title">Puzzle Game</div>
                </div>
            </div>
        </>
    )
}