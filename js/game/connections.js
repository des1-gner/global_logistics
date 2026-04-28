/**
 * Connection management — uses globe.gl arcsData for planes,
 * pathsData for trains/boats. Terrain validation enforced:
 * Trains: max ~6 consecutive water tiles (short crossings like English Channel ok).
 * Boats: max ~4 consecutive land tiles (short port approaches ok).
 * Players can use the draw feature to route around obstacles.
 */
const Connections = (function () {

    var TRAIN_MAX_WATER = 4;
    var BOAT_MAX_LAND = 3;

    function canConnect(fromCity, toCity, type) {
        var cost = GameState.getBuildCost(type, fromCity, toCity);
        if (!GameState.canAfford(cost)) {
            return { ok: false, reason: 'Need $' + cost.money + ' \uD83D\uDD29' + cost.steel + ' \u26FD' + cost.fuel };
        }
        return { ok: true, cost: cost };
    }

    /**
     * Check terrain along a route. Returns { ok } or { ok, reason }.
     */
    function validateTerrain(waypoints, type) {
        if (type === 'plane') return { ok: true };
        
        // If terrain hasn't loaded yet, block non-plane routes
        if (!Terrain.isReady()) {
            return { ok: false, reason: 'Terrain data still loading... try again in a moment.' };
        }

        var consecutive = 0;
        var maxConsecutive = 0;

        for (var w = 0; w < waypoints.length - 1; w++) {
            var from = waypoints[w];
            var to = waypoints[w + 1];
            var dLng = to.lng - from.lng;
            if (dLng > 180) dLng -= 360;
            if (dLng < -180) dLng += 360;

            var steps = Math.max(10, Math.ceil(60 * (Math.abs(to.lat - from.lat) + Math.abs(dLng)) / 180));

            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var lat = from.lat + (to.lat - from.lat) * t;
                var lng = from.lng + dLng * t;
                if (lng > 180) lng -= 360;
                if (lng < -180) lng += 360;

                var onLand = Terrain.isLand(lat, lng);

                if (type === 'train' && !onLand) {
                    consecutive++;
                } else if (type === 'boat' && onLand) {
                    consecutive++;
                } else {
                    consecutive = 0;
                }
                if (consecutive > maxConsecutive) maxConsecutive = consecutive;
            }
        }

        if (type === 'train' && maxConsecutive > TRAIN_MAX_WATER) {
            return { ok: false, reason: 'Train route crosses too much water! Draw around the coast or use a boat.' };
        }
        if (type === 'boat' && maxConsecutive > BOAT_MAX_LAND) {
            return { ok: false, reason: 'Boat route crosses too much land! Draw along the coast or use a train.' };
        }
        return { ok: true };
    }

    function connect(fromCity, toCity, type) {
        if (type !== 'plane') {
            return connectWithWaypoints(fromCity, toCity, type, [
                { lat: fromCity.data.lat, lng: fromCity.data.lng },
                { lat: toCity.data.lat, lng: toCity.data.lng },
            ]);
        }
        var check = canConnect(fromCity, toCity, type);
        if (!check.ok) return check;

        var conn = GameState.addConnection(fromCity, toCity, type);
        conn.waypoints = null;
        Passengers.spawnVehicle(conn);
        refreshGlobeData();
        return { ok: true, connection: conn };
    }

    function connectWithWaypoints(fromCity, toCity, type, waypoints) {
        // Terrain check first (before spending resources)
        var terrainCheck = validateTerrain(waypoints, type);
        if (!terrainCheck.ok) return terrainCheck;

        var check = canConnect(fromCity, toCity, type);
        if (!check.ok) return check;

        var conn = GameState.addConnection(fromCity, toCity, type);
        conn.waypoints = waypoints.map(function(w) { return { lat: w.lat, lng: w.lng }; });
        Passengers.spawnVehicle(conn);
        refreshGlobeData();
        return { ok: true, connection: conn };
    }

    function disconnect(connId) {
        // Remove vehicles first (drops passengers back at cities)
        Passengers.removeVehiclesForConnection(connId);

        var conn = GameState.removeConnection(connId);
        if (!conn) return;

        refreshGlobeData();
        return conn;
    }

    function refreshGlobeData() {
        var st = GameState.get();
        var arcs = [];
        var paths = [];

        st.connections.forEach(function(conn) {
            if (conn.type === 'plane') {
                arcs.push({
                    __connId: conn.id,
                    startLat: conn.from.data.lat,
                    startLng: conn.from.data.lng,
                    endLat: conn.to.data.lat,
                    endLng: conn.to.data.lng,
                    color: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)'],
                });
            } else {
                var wps = conn.waypoints || [
                    { lat: conn.from.data.lat, lng: conn.from.data.lng },
                    { lat: conn.to.data.lat, lng: conn.to.data.lng },
                ];

                var pathPoints = [];
                for (var w = 0; w < wps.length - 1; w++) {
                    var from = wps[w];
                    var to = wps[w + 1];
                    var steps = 30;
                    var dLng = to.lng - from.lng;
                    if (dLng > 180) dLng -= 360;
                    if (dLng < -180) dLng += 360;

                    for (var i = 0; i <= steps; i++) {
                        if (w > 0 && i === 0) continue;
                        var t = i / steps;
                        var lat = from.lat + (to.lat - from.lat) * t;
                        var lng = from.lng + dLng * t;
                        if (lng > 180) lng -= 360;
                        if (lng < -180) lng += 360;
                        var alt = conn.type === 'train' ? 0.006 : 0.004;
                        pathPoints.push([lat, lng, alt]);
                    }
                }

                var color;
                if (conn.type === 'train') {
                    color = ['rgba(40,40,40,0.9)'];
                } else {
                    color = ['rgba(220,60,60,0.8)'];
                }

                paths.push({
                    __connId: conn.id,
                    points: pathPoints,
                    color: color,
                });
            }
        });

        GlobeEngine.updateArcs(arcs);
        GlobeEngine.updatePaths(paths);
    }

    function getPositionAlongConnection(conn, t) {
        t = Math.max(0, Math.min(1, t));

        if (conn.type === 'plane') {
            var lat = conn.from.data.lat + (conn.to.data.lat - conn.from.data.lat) * t;
            var dLng = conn.to.data.lng - conn.from.data.lng;
            if (dLng > 180) dLng -= 360;
            if (dLng < -180) dLng += 360;
            var lng = conn.from.data.lng + dLng * t;
            if (lng > 180) lng -= 360;
            if (lng < -180) lng += 360;
            var dist = Math.sqrt(Math.pow(conn.to.data.lat - conn.from.data.lat, 2) + Math.pow(dLng, 2));
            var alt = 0.02 + Math.sin(t * Math.PI) * dist * 0.003;
            return { lat: lat, lng: lng, alt: alt };
        }

        var wps = conn.waypoints || [
            { lat: conn.from.data.lat, lng: conn.from.data.lng },
            { lat: conn.to.data.lat, lng: conn.to.data.lng },
        ];

        var totalDist = 0;
        for (var i = 1; i < wps.length; i++) {
            var dL = wps[i].lng - wps[i-1].lng;
            if (dL > 180) dL -= 360;
            if (dL < -180) dL += 360;
            totalDist += Math.sqrt(Math.pow(wps[i].lat - wps[i-1].lat, 2) + Math.pow(dL, 2));
        }

        var targetDist = totalDist * t;
        var accumulated = 0;

        for (var j = 1; j < wps.length; j++) {
            var prev = wps[j - 1];
            var curr = wps[j];
            var dLn = curr.lng - prev.lng;
            if (dLn > 180) dLn -= 360;
            if (dLn < -180) dLn += 360;
            var segDist = Math.sqrt(Math.pow(curr.lat - prev.lat, 2) + Math.pow(dLn, 2));

            if (accumulated + segDist >= targetDist || j === wps.length - 1) {
                var segT = segDist > 0 ? (targetDist - accumulated) / segDist : 0;
                var rLat = prev.lat + (curr.lat - prev.lat) * Math.min(1, segT);
                var rLng = prev.lng + dLn * Math.min(1, segT);
                if (rLng > 180) rLng -= 360;
                if (rLng < -180) rLng += 360;
                var rAlt = conn.type === 'train' ? 0.008 : 0.006;
                return { lat: rLat, lng: rLng, alt: rAlt };
            }
            accumulated += segDist;
        }

        var last = wps[wps.length - 1];
        return { lat: last.lat, lng: last.lng, alt: 0.008 };
    }

    return {
        canConnect: canConnect,
        connect: connect,
        connectWithWaypoints: connectWithWaypoints,
        disconnect: disconnect,
        getPositionAlongConnection: getPositionAlongConnection,
        refreshGlobeData: refreshGlobeData,
    };
})();
