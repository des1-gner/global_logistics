/**
 * Main game loop — economy-driven, no resource limits, just money.
 */
(function () {
    const container = document.getElementById('game-container');
    const overlay = document.getElementById('overlay');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');

    GlobeEngine.init(container);
    HUD.init();
    Tooltip.init();
    Controls.init();

    const WEEK_DURATION = 30;
    const WEEKLY_INCOME = 25; // passive income per week

    const clock = new THREE.Clock(false);

    function startGame() {
        overlay.style.display = 'none';
        gameOverOverlay.style.display = 'none';
        clearAllVisuals();

        GameState.reset();
        const st = GameState.get();
        st.running = true;

        Spawner.spawnInitialCities(4);
        st.activeCities.forEach(city => Passengers.spawnPassenger(city));

        HUD.update();
        clock.start();
    }

    function clearAllVisuals() {
        [GlobeEngine.getMarkerGroup(), GlobeEngine.getArcGroup(), GlobeEngine.getPassengerGroup()].forEach(group => {
            while (group.children.length > 0) {
                const c = group.children[0];
                group.remove(c);
                if (c.traverse) {
                    c.traverse(child => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (child.material.map) child.material.map.dispose();
                            child.material.dispose();
                        }
                    });
                } else {
                    if (c.geometry) c.geometry.dispose();
                    if (c.material) {
                        if (c.material.map) c.material.map.dispose();
                        c.material.dispose();
                    }
                }
            }
        });
    }

    function gameOver(reason) {
        const st = GameState.get();
        st.running = false;
        st.gameOver = true;
        clock.stop();

        document.getElementById('game-over-reason').textContent = reason;
        document.getElementById('game-over-stats').innerHTML = `
            <div class="stat">Score: <span>${st.score}</span></div>
            <div class="stat">Passengers delivered: <span>${st.delivered}</span></div>
            <div class="stat">Money earned: <span>$${st.money}</span></div>
            <div class="stat">Cities active: <span>${st.activeCities.length}</span></div>
            <div class="stat">Weeks survived: <span>${st.week}</span></div>
        `;
        gameOverOverlay.style.display = 'flex';
    }

    function animate() {
        requestAnimationFrame(animate);

        const st = GameState.get();
        const dt = clock.getDelta();

        Controls.updateRotation(dt);

        if (st.running) {
            st.elapsed += dt;

            // Spawn new cities
            if (st.elapsed - st.lastSpawnTime > st.spawnInterval) {
                st.lastSpawnTime = st.elapsed;
                const newCity = Spawner.spawnNextCity();
                if (newCity) Passengers.spawnPassenger(newCity);
                st.spawnInterval = Math.max(4, st.spawnInterval - 0.15);
            }

            // Spawn passengers
            if (st.elapsed - st.lastPassengerTime > st.passengerInterval) {
                st.lastPassengerTime = st.elapsed;
                const count = Math.min(st.activeCities.length, 1 + Math.floor(st.week / 3));
                const shuffled = [...st.activeCities].sort(() => Math.random() - 0.5);
                for (let i = 0; i < count; i++) Passengers.spawnPassenger(shuffled[i]);
                st.passengerInterval = Math.max(1.5, st.passengerInterval - 0.05);
            }

            // Weekly tick
            const newWeek = Math.floor(st.elapsed / WEEK_DURATION) + 1;
            if (newWeek > st.week) {
                st.week = newWeek;
                st.money += WEEKLY_INCOME;
            }

            // Board passengers
            st.activeCities.forEach(city => Passengers.tryBoardPassengers(city));

            // Update travelers
            Passengers.updateTravelers(dt);

            // Update passenger dots
            st.activeCities.forEach(city => Spawner.updatePassengerDots(city));

            // Pulse overloaded cities
            st.activeCities.forEach(city => {
                if (!city.mesh) return;
                city.pulsePhase += dt * 2;
                const overflow = city.passengers.length / GameState.MAX_PASSENGERS_PER_CITY;
                if (overflow > 0.5) {
                    city.mesh.scale.setScalar(1 + Math.sin(city.pulsePhase * 4) * 0.15 * overflow);
                } else {
                    city.mesh.scale.setScalar(1);
                }
            });

            // Game over check
            const overflowed = st.activeCities.find(c => c.passengers.length > GameState.MAX_PASSENGERS_PER_CITY);
            if (overflowed) gameOver(`${overflowed.data.name} overflowed with passengers!`);

            HUD.update();
        }

        GlobeEngine.render();
    }

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    animate();
})();
