/**
 * Main game loop — multi-resource economy, maintenance, speed control, sound.
 * Built on globe.gl — no manual THREE.js rendering needed.
 */
(function () {
    const container = document.getElementById('globe-container');
    const overlay = document.getElementById('overlay');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const soundToggle = document.getElementById('sound-toggle');

    try {
        GlobeEngine.init(container);
    } catch(e) {
        console.error('Globe init failed:', e);
    }
    Sound.init();
    HUD.init();
    try {
        Tooltip.init();
    } catch(e) {
        console.error('Tooltip init failed:', e);
    }
    try {
        Controls.init();
    } catch(e) {
        console.error('Controls init failed:', e);
    }

    const WEEK_DURATION = 30; // real seconds per game week (at normal speed)
    let lastTime = 0;
    let running = false;

    // Sound toggle
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            const on = Sound.toggle();
            soundToggle.textContent = on ? '\uD83D\uDD0A' : '\uD83D\uDD07';
            soundToggle.classList.toggle('muted', !on);
        });
    }

    function startGame() {
        try {
            Sound.resume();
            Sound.gameStart();

            overlay.style.display = 'none';
            gameOverOverlay.style.display = 'none';
            clearAllVisuals();

            GameState.reset();
            const st = GameState.get();
            st.running = true;
            running = true;

            Spawner.spawnInitialCities(5);
            st.activeCities.forEach(city => Passengers.spawnPassenger(city));

            HUD.update();
            lastTime = performance.now();
            requestAnimationFrame(animate);
        } catch(e) {
            console.error('Start game failed:', e);
        }
    }

    function clearAllVisuals() {
        // Clear passenger group
        const pg = GlobeEngine.getPassengerGroup();
        if (pg) {
            while (pg.children.length > 0) {
                const c = pg.children[0];
                pg.remove(c);
                if (c.geometry) c.geometry.dispose();
                if (c.material) c.material.dispose();
            }
        }

        // Clear preview group
        const pvg = GlobeEngine.getPreviewGroup();
        if (pvg) {
            while (pvg.children.length > 0) {
                const c = pvg.children[0];
                pvg.remove(c);
                if (c.geometry) c.geometry.dispose();
                if (c.material) c.material.dispose();
            }
        }

        // Clear globe.gl data layers
        try {
            GlobeEngine.updateCityObjects([]);
            GlobeEngine.updateArcs([]);
            GlobeEngine.updatePaths([]);
            GlobeEngine.updateCityBadges([]);
        } catch(e) {
            console.warn('Clear visuals:', e);
        }
    }

    function gameOver(reason) {
        const st = GameState.get();
        st.running = false;
        st.gameOver = true;
        running = false;
        Sound.gameOver();

        document.getElementById('game-over-reason').textContent = reason;
        document.getElementById('game-over-stats').innerHTML =
            '<div class="stat">Score: <span>' + st.score + '</span></div>' +
            '<div class="stat">Passengers delivered: <span>' + st.delivered + '</span></div>' +
            '<div class="stat">Money: <span>' + st.resources.money + '</span></div>' +
            '<div class="stat">Cities: <span>' + st.activeCities.length + '</span></div>' +
            '<div class="stat">Weeks survived: <span>' + st.week + '</span></div>' +
            '<div class="stat">Connections: <span>' + st.connections.length + '</span></div>';
        gameOverOverlay.style.display = 'flex';
    }

    function animate(now) {
        if (!running) return;
        requestAnimationFrame(animate);

        const st = GameState.get();
        const rawDt = Math.min((now - lastTime) / 1000, 0.1); // cap at 100ms
        lastTime = now;
        const speedMult = GameState.getSpeedMult();
        const dt = rawDt * speedMult;

        if (st.running) {
            st.elapsed += dt;

            // Spawn new cities
            if (st.elapsed - st.lastSpawnTime > st.spawnInterval) {
                st.lastSpawnTime = st.elapsed;
                const newCity = Spawner.spawnNextCity();
                if (newCity) {
                    Passengers.spawnPassenger(newCity);
                    Sound.citySpawn();
                }
                st.spawnInterval = Math.max(3, st.spawnInterval - 0.12);
            }

            // Spawn passengers — slower as cities fill up
            if (st.elapsed - st.lastPassengerTime > st.passengerInterval) {
                st.lastPassengerTime = st.elapsed;
                const count = Math.min(st.activeCities.length, 1 + Math.floor(st.week / 4));
                const shuffled = [...st.activeCities].sort(() => Math.random() - 0.5);
                for (let i = 0; i < count; i++) {
                    const city = shuffled[i];
                    // Spawn chance decreases as city fills: 100% at 0, 60% at 1, 35% at 2, 20% at 3, etc.
                    const fullness = city.passengers.length / GameState.MAX_PASSENGERS_PER_CITY;
                    const spawnChance = Math.pow(1 - fullness, 2);
                    if (Math.random() < spawnChance) {
                        Passengers.spawnPassenger(city);
                    }
                }
                st.passengerInterval = Math.max(2.0, st.passengerInterval - 0.03);
            }

            // Weekly tick
            const newWeek = Math.floor(st.elapsed / WEEK_DURATION) + 1;
            if (newWeek > st.week) {
                st.week = newWeek;
                GameState.applyWeeklyIncome();
                Sound.weekTick();

                const solvent = GameState.deductMaintenance();
                if (!solvent) {
                    gameOver('Ran out of resources! Too many connections to maintain.');
                    return;
                }
            }

            // Board passengers
            st.activeCities.forEach(city => Passengers.tryBoardPassengers(city));

            // Update travelers
            Passengers.updateTravelers(dt);

            // Update passenger badges on cities
            Spawner.refreshCityBadges();

            // Game over: overflow
            const overflowed = st.activeCities.find(c => c.passengers.length > GameState.MAX_PASSENGERS_PER_CITY);
            if (overflowed) gameOver(overflowed.data.name + ' overflowed with passengers!');

            HUD.update();
        }
    }

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
})();