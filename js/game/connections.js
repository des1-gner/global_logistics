/**
 * Connection management — terrain-aware paths.
 * Trains: follow great circle on land surface, bridge segments over water (yellow + pillars).
 * Boats: follow great circle on water surface, slightly raised.
 * Planes: high arc, simple.
 * No connection limits — any two cities can be connected.
 */
const Connections = (function () {
    const R = GlobeEngine.GLOBE_RADIUS;

    const COLORS = {
        trainLand:  0x4ade80,
        bridge:     0xfbbf24,
        boatWater:  0x38bdf8,
        boatLand:   0xf87171,  // shouldn't happen much
        plane:      0x60a5fa,
    };

    function canConnect(fromCity, toCity, type) {
        const st = GameState.get();
        const cost = GameState.TRANSPORT_COSTS[type];
        if (st.money < cost) return { ok: false, reason: 'Need $' + cost };
        // No other restrictions — any two cities, duplicates allowed
        return { ok: true };
    }

    /**
     * Generate path points between two cities as a great-circle interpolation.
     * Each point is tagged with terrain type.
     */
    function generatePathPoints(fromData, toData, type, steps) {
        steps = steps || 60;
        const points = [];

        // Handle date-line wrapping
        let dLon = toData.lon - fromData.lon;
        if (dLon > 180) dLon -= 360;
        if (dLon < -180) dLon += 360;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const lat = fromData.lat + (toData.lat - fromData.lat) * t;
            let lon = fromData.lon + dLon * t;
            if (lon > 180) lon -= 360;
            if (lon < -180) lon += 360;

            const onLand = Terrain.isReady() ? Terrain.isLand(lat, lon) : true;

            let terrain, height;
            if (type === 'train') {
                terrain = onLand ? 'land' : 'bridge';
                height = onLand ? R * 1.003 : R * 1.015;
            } else if (type === 'boat') {
                terrain = onLand ? 'land' : 'water';
                height = onLand ? R * 1.003 : R * 1.002;
            } else {
                terrain = 'air';
                height = R * 1.003; // will be overridden
            }

            points.push({ lat, lon, terrain, height });
        }

        return points;
    }

    function buildConnectionMesh(fromCity, toCity, type) {
        const from = fromCity.data, to = toCity.data;
        const group = new THREE.Group();

        // Planes: simple high arc
        if (type === 'plane') {
            const start = GlobeEngine.latLonToVec3(from.lat, from.lon, R * 1.004);
            const end = GlobeEngine.latLonToVec3(to.lat, to.lon, R * 1.004);
            const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            const dist = start.distanceTo(end);
            mid.normalize().multiplyScalar(R + 0.3 * dist);

            const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
            const pts = curve.getPoints(60);
            group.add(new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(pts),
                new THREE.LineBasicMaterial({ color: COLORS.plane, transparent: true, opacity: 0.5 })
            ));
            group.userData.curve = curve;
            return group;
        }

        // Trains / Boats: terrain-aware segmented path
        const pathPoints = generatePathPoints(from, to, type);
        const allVec3 = pathPoints.map(p => GlobeEngine.latLonToVec3(p.lat, p.lon, p.height));

        // Draw segments colored by terrain
        let segStart = 0;
        let currentTerrain = pathPoints[0].terrain;

        for (let i = 1; i <= pathPoints.length; i++) {
            const nextTerrain = i < pathPoints.length ? pathPoints[i].terrain : null;

            if (nextTerrain !== currentTerrain || i === pathPoints.length) {
                const segPts = allVec3.slice(segStart, Math.min(i + 1, allVec3.length));
                if (segPts.length >= 2) {
                    let color;
                    if (type === 'train') {
                        color = currentTerrain === 'bridge' ? COLORS.bridge : COLORS.trainLand;
                    } else {
                        color = currentTerrain === 'water' ? COLORS.boatWater : COLORS.boatLand;
                    }

                    const mat = new THREE.LineBasicMaterial({
                        color, transparent: true,
                        opacity: currentTerrain === 'bridge' ? 0.7 : 0.55,
                    });
                    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(segPts), mat));

                    // Bridge pillars for train water crossings
                    if (type === 'train' && currentTerrain === 'bridge' && segPts.length >= 2) {
                        const pillarMat = new THREE.LineBasicMaterial({ color: COLORS.bridge, transparent: true, opacity: 0.35 });
                        const pillarIndices = [0, Math.floor(segPts.length / 2), segPts.length - 1];
                        for (const pi of pillarIndices) {
                            if (pi >= segPts.length) continue;
                            const top = segPts[pi];
                            const bottom = top.clone().normalize().multiplyScalar(R * 1.001);
                            group.add(new THREE.Line(
                                new THREE.BufferGeometry().setFromPoints([bottom, top]), pillarMat
                            ));
                        }
                    }
                }
                segStart = Math.max(0, i - 1);
                if (nextTerrain) currentTerrain = nextTerrain;
            }
        }

        // Smooth curve for traveler animation
        const curve = new THREE.CatmullRomCurve3(allVec3, false, 'centripetal', 0.3);
        group.userData.curve = curve;
        return group;
    }

    function connect(fromCity, toCity, type) {
        const check = canConnect(fromCity, toCity, type);
        if (!check.ok) return check;

        const conn = GameState.addConnection(fromCity, toCity, type);
        const meshGroup = buildConnectionMesh(fromCity, toCity, type);
        conn.mesh = meshGroup;
        GlobeEngine.getArcGroup().add(meshGroup);

        return { ok: true, connection: conn };
    }

    function disconnect(connId) {
        const conn = GameState.removeConnection(connId);
        if (!conn) return;

        if (conn.mesh) {
            GlobeEngine.getArcGroup().remove(conn.mesh);
            conn.mesh.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }

        const st = GameState.get();
        const toRemove = st.travelers.filter(t => t.connection.id === connId);
        toRemove.forEach(t => {
            GlobeEngine.getPassengerGroup().remove(t.mesh);
            if (t.mesh.geometry) t.mesh.geometry.dispose();
            if (t.mesh.material) t.mesh.material.dispose();
        });
        st.travelers = st.travelers.filter(t => t.connection.id !== connId);

        return conn;
    }

    function getArcCurve(conn) {
        return conn.mesh?.userData?.curve || null;
    }

    return { canConnect, connect, disconnect, getArcCurve };
})();
