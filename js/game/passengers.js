/**
 * Passenger system — BFS pathfinding, boarding, travel, delivery with economy.
 */
const Passengers = (function () {
    const R = GlobeEngine.GLOBE_RADIUS;

    function createTravelerMesh(type, destRegion) {
        const color = new THREE.Color(REGIONS[destRegion]?.color || '#ffffff');
        let geom;
        if (type === 'plane') {
            geom = new THREE.ConeGeometry(0.005, 0.014, 4);
        } else if (type === 'boat') {
            geom = new THREE.BoxGeometry(0.011, 0.004, 0.006);
        } else {
            geom = new THREE.BoxGeometry(0.009, 0.005, 0.005);
        }
        return new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ color }));
    }

    /**
     * BFS: find shortest path from startCity to any city in destRegion.
     * Returns the first connection to take, or null.
     */
    function findPathToRegion(startCity, destRegion) {
        const visited = new Set();
        const queue = [];
        visited.add(startCity.id);

        const startConns = GameState.findConnectionsForCity(startCity);
        for (const conn of startConns) {
            const neighbor = conn.from.id === startCity.id ? conn.to : conn.from;
            if (visited.has(neighbor.id)) continue;
            visited.add(neighbor.id);
            if (neighbor.data.region === destRegion) return { conn, nextCity: neighbor };
            queue.push({ city: neighbor, firstConn: conn });
        }

        while (queue.length > 0) {
            const { city, firstConn } = queue.shift();
            const conns = GameState.findConnectionsForCity(city);
            for (const conn of conns) {
                const neighbor = conn.from.id === city.id ? conn.to : conn.from;
                if (visited.has(neighbor.id)) continue;
                visited.add(neighbor.id);
                if (neighbor.data.region === destRegion) {
                    const next = firstConn.from.id === startCity.id ? firstConn.to : firstConn.from;
                    return { conn: firstConn, nextCity: next };
                }
                queue.push({ city: neighbor, firstConn });
            }
        }
        return null;
    }

    function spawnPassenger(city) {
        if (city.passengers.length >= GameState.MAX_PASSENGERS_PER_CITY) return null;
        const regionKeys = Object.keys(REGIONS);
        const otherRegions = regionKeys.filter(r => r !== city.data.region);
        if (otherRegions.length === 0) return null;

        const destRegion = otherRegions[Math.floor(Math.random() * otherRegions.length)];
        const passenger = {
            id: Math.random().toString(36).substr(2, 8),
            originRegion: city.data.region,
            destRegion,
            color: REGIONS[destRegion].color,
        };
        city.passengers.push(passenger);
        return passenger;
    }

    function tryBoardPassengers(city) {
        const st = GameState.get();
        if (city.passengers.length === 0) return;
        const conns = GameState.findConnectionsForCity(city);
        if (conns.length === 0) return;

        const toBoard = [];
        for (const passenger of city.passengers) {
            const path = findPathToRegion(city, passenger.destRegion);
            if (path) toBoard.push({ passenger, conn: path.conn });
        }

        // Board up to 2 per tick
        for (const { passenger, conn } of toBoard.slice(0, 2)) {
            const idx = city.passengers.indexOf(passenger);
            if (idx === -1) continue;
            city.passengers.splice(idx, 1);

            const isForward = conn.from.id === city.id;
            const mesh = createTravelerMesh(conn.type, passenger.destRegion);
            GlobeEngine.getPassengerGroup().add(mesh);

            st.travelers.push({
                mesh, connection: conn,
                progress: isForward ? 0 : 1,
                direction: isForward ? 1 : -1,
                passenger,
                speed: GameState.TRANSPORT_TYPES[conn.type].speed,
                fromCity: city,
            });
        }
    }

    function updateTravelers(dt) {
        const st = GameState.get();
        const arrived = [];

        for (const traveler of st.travelers) {
            traveler.progress += traveler.direction * traveler.speed * dt;

            const curve = Connections.getArcCurve(traveler.connection);
            if (curve) {
                const t = Math.max(0, Math.min(1, traveler.progress));
                const pos = curve.getPoint(t);
                traveler.mesh.position.copy(pos);
                if (t > 0.01 && t < 0.99) {
                    const ahead = curve.getPoint(Math.min(1, t + 0.02));
                    traveler.mesh.lookAt(ahead);
                }
            }

            if (traveler.progress >= 1 || traveler.progress <= 0) arrived.push(traveler);
        }

        for (const traveler of arrived) {
            const conn = traveler.connection;
            const destCity = traveler.direction > 0 ? conn.to : conn.from;

            GlobeEngine.getPassengerGroup().remove(traveler.mesh);
            if (traveler.mesh.geometry) traveler.mesh.geometry.dispose();
            if (traveler.mesh.material) traveler.mesh.material.dispose();

            if (destCity.data.region === traveler.passenger.destRegion) {
                // Delivered! Economy reward
                GameState.deliverPassenger(traveler.passenger.originRegion, traveler.passenger.destRegion);
            } else {
                // Transfer
                if (destCity.passengers.length < GameState.MAX_PASSENGERS_PER_CITY) {
                    destCity.passengers.push(traveler.passenger);
                }
            }
        }

        st.travelers = st.travelers.filter(t => !arrived.includes(t));
    }

    return { spawnPassenger, tryBoardPassengers, updateTravelers };
})();
