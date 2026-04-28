/**
 * Passenger system — permanent vehicles on every connection.
 * Vehicles shuttle back and forth continuously, picking up/dropping off passengers.
 * BFS pathfinding determines which connection a passenger should board.
 */
const Passengers = (function () {

    var MAX_VEHICLE_CAPACITY = 4;

    function createVehicleMesh(type) {
        var group = new THREE.Group();
        var vehicleMesh;

        if (type === 'plane') {
            vehicleMesh = new THREE.Mesh(
                new THREE.ConeGeometry(0.5, 1.5, 4),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            vehicleMesh.rotation.x = Math.PI / 2;
        } else if (type === 'boat') {
            vehicleMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1.0, 0.35, 0.6),
                new THREE.MeshBasicMaterial({ color: 0xdc3c3c })
            );
        } else {
            vehicleMesh = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.45, 1.2),
                new THREE.MeshBasicMaterial({ color: 0x333333 })
            );
        }
        group.add(vehicleMesh);

        // Passenger indicator slots (up to MAX_VEHICLE_CAPACITY colored dots on top)
        group.userData.indicators = [];
        for (var i = 0; i < MAX_VEHICLE_CAPACITY; i++) {
            var dot = new THREE.Mesh(
                new THREE.SphereGeometry(0.18, 6, 6),
                new THREE.MeshBasicMaterial({ color: 0x888888, visible: false })
            );
            var spacing = 0.35;
            var offset = (i - (MAX_VEHICLE_CAPACITY - 1) / 2) * spacing;
            dot.position.set(offset, 0.45, 0);
            group.add(dot);
            group.userData.indicators.push(dot);
        }

        return group;
    }

    /**
     * Update the colored dots on a vehicle mesh to show carried passengers.
     */
    function updateVehicleIndicators(vehicle) {
        var indicators = vehicle.mesh.userData.indicators;
        if (!indicators) return;
        for (var i = 0; i < indicators.length; i++) {
            if (i < vehicle.passengers.length) {
                var p = vehicle.passengers[i];
                var color = REGIONS[p.destRegion] ? REGIONS[p.destRegion].color : '#ffffff';
                indicators[i].material.color.set(color);
                indicators[i].material.visible = true;
                indicators[i].visible = true;
            } else {
                indicators[i].material.visible = false;
                indicators[i].visible = false;
            }
        }
    }

    /**
     * Spawn a permanent vehicle on a connection. Called when a connection is built.
     */
    function spawnVehicle(conn) {
        var st = GameState.get();
        var mesh = createVehicleMesh(conn.type);
        var pg = GlobeEngine.getPassengerGroup();
        if (pg) pg.add(mesh);

        var vehicle = {
            mesh: mesh,
            connection: conn,
            progress: 0,
            direction: 1,  // 1 = from→to, -1 = to→from
            speed: GameState.TRANSPORT_TYPES[conn.type].speed,
            passengers: [],  // passengers currently on board
        };
        st.vehicles.push(vehicle);
        return vehicle;
    }

    /**
     * Remove all vehicles on a connection.
     */
    function removeVehiclesForConnection(connId) {
        var st = GameState.get();
        var toRemove = st.vehicles.filter(function(v) { return v.connection.id === connId; });
        toRemove.forEach(function(v) {
            // Drop passengers back at nearest city
            var city = v.direction > 0 ? v.connection.from : v.connection.to;
            v.passengers.forEach(function(p) {
                if (city.passengers.length < GameState.MAX_PASSENGERS_PER_CITY) {
                    city.passengers.push(p);
                }
            });
            var pg = GlobeEngine.getPassengerGroup();
            if (pg) pg.remove(v.mesh);
            v.mesh.traverse(function(child) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        st.vehicles = st.vehicles.filter(function(v) { return v.connection.id !== connId; });
    }

    /**
     * BFS: find shortest path from startCity to any city in destRegion.
     * Returns the first connection to take, or null.
     */
    function findPathToRegion(startCity, destRegion) {
        var visited = {};
        var queue = [];
        visited[startCity.id] = true;

        var startConns = GameState.findConnectionsForCity(startCity);
        for (var i = 0; i < startConns.length; i++) {
            var conn = startConns[i];
            var neighbor = conn.from.id === startCity.id ? conn.to : conn.from;
            if (visited[neighbor.id]) continue;
            visited[neighbor.id] = true;
            if (neighbor.data.region === destRegion) return { conn: conn };
            queue.push({ city: neighbor, firstConn: conn });
        }

        while (queue.length > 0) {
            var item = queue.shift();
            var conns = GameState.findConnectionsForCity(item.city);
            for (var j = 0; j < conns.length; j++) {
                var c = conns[j];
                var nb = c.from.id === item.city.id ? c.to : c.from;
                if (visited[nb.id]) continue;
                visited[nb.id] = true;
                if (nb.data.region === destRegion) return { conn: item.firstConn };
                queue.push({ city: nb, firstConn: item.firstConn });
            }
        }
        return null;
    }

    function spawnPassenger(city) {
        if (city.passengers.length >= GameState.MAX_PASSENGERS_PER_CITY) return null;
        var regionKeys = Object.keys(REGIONS);
        var otherRegions = regionKeys.filter(function(r) { return r !== city.data.region; });
        if (otherRegions.length === 0) return null;

        var destRegion = otherRegions[Math.floor(Math.random() * otherRegions.length)];
        var passenger = {
            id: Math.random().toString(36).substr(2, 8),
            originRegion: city.data.region,
            destRegion: destRegion,
            color: REGIONS[destRegion].color,
        };
        city.passengers.push(passenger);
        return passenger;
    }

    /**
     * When a vehicle arrives at a city:
     * 1. Drop off passengers whose destination region matches this city
     * 2. Transfer passengers who need a different connection
     * 3. Pick up new passengers heading in the right direction
     */
    function handleVehicleArrival(vehicle, arrivalCity) {
        var st = GameState.get();

        // Drop off passengers
        var remaining = [];
        for (var i = 0; i < vehicle.passengers.length; i++) {
            var p = vehicle.passengers[i];
            if (arrivalCity.data.region === p.destRegion) {
                // Delivered!
                GameState.deliverPassenger(p.originRegion, p.destRegion);
                Sound.deliver();
            } else {
                // Transfer: put back in city to find next connection
                if (arrivalCity.passengers.length < GameState.MAX_PASSENGERS_PER_CITY) {
                    arrivalCity.passengers.push(p);
                }
            }
        }
        vehicle.passengers = [];

        // Pick up passengers from this city who want to go via this connection
        var conn = vehicle.connection;
        var otherCity = arrivalCity.id === conn.from.id ? conn.to : conn.from;

        var toBoard = [];
        for (var j = 0; j < arrivalCity.passengers.length; j++) {
            if (toBoard.length >= MAX_VEHICLE_CAPACITY) break;
            var passenger = arrivalCity.passengers[j];
            var path = findPathToRegion(arrivalCity, passenger.destRegion);
            if (path && path.conn.id === conn.id) {
                toBoard.push(passenger);
            }
        }

        // Board them
        for (var k = 0; k < toBoard.length; k++) {
            var idx = arrivalCity.passengers.indexOf(toBoard[k]);
            if (idx !== -1) {
                arrivalCity.passengers.splice(idx, 1);
                vehicle.passengers.push(toBoard[k]);
            }
        }

        updateVehicleIndicators(vehicle);
    }

    /**
     * Update all vehicles — move them along their connections, handle arrivals.
     */
    function updateVehicles(dt) {
        var st = GameState.get();
        var globe = GlobeEngine.getGlobe();

        for (var i = 0; i < st.vehicles.length; i++) {
            var v = st.vehicles[i];
            v.progress += v.direction * v.speed * dt;

            // Arrived at one end
            if (v.progress >= 1) {
                v.progress = 1;
                handleVehicleArrival(v, v.connection.to);
                v.direction = -1; // reverse
                v.progress = 1;
            } else if (v.progress <= 0) {
                v.progress = 0;
                handleVehicleArrival(v, v.connection.from);
                v.direction = 1; // reverse
                v.progress = 0;
            }

            // Position the vehicle
            var t = Math.max(0, Math.min(1, v.progress));
            var pos = Connections.getPositionAlongConnection(v.connection, t);
            if (pos && globe) {
                var coords = globe.getCoords(pos.lat, pos.lng, pos.alt);
                if (coords) {
                    v.mesh.position.set(coords.x, coords.y, coords.z);
                }
            }
        }
    }

    // Keep old API names for compatibility with main.js
    function tryBoardPassengers(city) {
        // Boarding now happens in handleVehicleArrival — this is a no-op
    }

    function updateTravelers(dt) {
        updateVehicles(dt);
    }

    return {
        spawnPassenger: spawnPassenger,
        tryBoardPassengers: tryBoardPassengers,
        updateTravelers: updateTravelers,
        spawnVehicle: spawnVehicle,
        removeVehiclesForConnection: removeVehiclesForConnection,
    };
})();
