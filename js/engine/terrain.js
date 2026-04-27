/**
 * Terrain system — determines land vs water at any lat/lon coordinate.
 * Uses a rasterized grid sampled from the loaded TopoJSON land polygons.
 * Also provides terrain-aware path generation for trains and boats.
 */
const Terrain = (function () {
    // Grid resolution: 360x180 = 1 degree per cell
    const GRID_W = 360;
    const GRID_H = 180;
    let landGrid = null; // Uint8Array, 1 = land, 0 = water
    let ready = false;

    /**
     * Build the land grid from TopoJSON land features.
     * Called once after world data loads.
     */
    function buildFromTopology(topology) {
        landGrid = new Uint8Array(GRID_W * GRID_H);
        const land = topojson.feature(topology, topology.objects.land);

        land.features.forEach(feature => {
            const geom = feature.geometry;
            const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
            polygons.forEach(polygon => {
                const ring = polygon[0]; // outer ring
                rasterizePolygon(ring);
            });
        });

        ready = true;
    }

    /**
     * Simple scanline rasterization of a polygon ring into the grid.
     */
    function rasterizePolygon(ring) {
        // Get bounding box
        let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
        for (const [lon, lat] of ring) {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lon < minLon) minLon = lon;
            if (lon > maxLon) maxLon = lon;
        }

        const startRow = Math.max(0, Math.floor(latToRow(maxLat)));
        const endRow = Math.min(GRID_H - 1, Math.ceil(latToRow(minLat)));
        const startCol = Math.max(0, Math.floor(lonToCol(minLon)));
        const endCol = Math.min(GRID_W - 1, Math.ceil(lonToCol(maxLon)));

        for (let row = startRow; row <= endRow; row++) {
            const lat = rowToLat(row);
            for (let col = startCol; col <= endCol; col++) {
                const lon = colToLon(col);
                if (pointInRing(lon, lat, ring)) {
                    landGrid[row * GRID_W + col] = 1;
                }
            }
        }
    }

    function latToRow(lat) { return (90 - lat); }       // 0 = north pole, 179 = south pole
    function lonToCol(lon) { return (lon + 180); }       // 0 = -180, 359 = +179
    function rowToLat(row) { return 90 - row; }
    function colToLon(col) { return col - 180; }

    /**
     * Ray-casting point-in-polygon test.
     */
    function pointInRing(px, py, ring) {
        let inside = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const xi = ring[i][0], yi = ring[i][1];
            const xj = ring[j][0], yj = ring[j][1];
            if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        return inside;
    }

    /**
     * Check if a lat/lon point is on land.
     */
    function isLand(lat, lon) {
        if (!ready) return false;
        const row = Math.round(latToRow(lat));
        const col = Math.round(lonToCol(lon));
        if (row < 0 || row >= GRID_H || col < 0 || col >= GRID_W) return false;
        return landGrid[row * GRID_W + col] === 1;
    }

    function isWater(lat, lon) {
        return !isLand(lat, lon);
    }

    /**
     * Generate a terrain-aware path between two lat/lon points.
     * For trains: stays on land, adds bridge segments over water.
     * For boats: stays on water, hugs coastlines.
     * Returns array of { lat, lon, terrain: 'land'|'water'|'bridge' }
     */
    function generatePath(fromLat, fromLon, toLat, toLon, type) {
        const steps = 80;
        const points = [];

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            let lat = fromLat + (toLat - fromLat) * t;
            let lon = fromLon + (toLon - fromLon) * t;

            // Handle wrapping around the date line
            let dLon = toLon - fromLon;
            if (dLon > 180) dLon -= 360;
            if (dLon < -180) dLon += 360;
            lon = fromLon + dLon * t;
            if (lon > 180) lon -= 360;
            if (lon < -180) lon += 360;

            const onLand = isLand(lat, lon);

            let terrain;
            if (type === 'train') {
                terrain = onLand ? 'land' : 'bridge';
            } else if (type === 'boat') {
                terrain = onLand ? 'port' : 'water';
            } else {
                terrain = 'air';
            }

            points.push({ lat, lon, terrain });
        }

        // For boats: try to nudge water-path points that are on land
        if (type === 'boat') {
            for (let i = 1; i < points.length - 1; i++) {
                if (points[i].terrain === 'port') {
                    // Try to find nearby water by shifting perpendicular
                    const nudged = nudgeToWater(points[i].lat, points[i].lon, fromLat, fromLon, toLat, toLon);
                    if (nudged) {
                        points[i].lat = nudged.lat;
                        points[i].lon = nudged.lon;
                        points[i].terrain = 'water';
                    }
                }
            }
        }

        return points;
    }

    /**
     * Try to nudge a point perpendicular to the path direction to find water.
     */
    function nudgeToWater(lat, lon, fromLat, fromLon, toLat, toLon) {
        // Direction of travel
        let dLon = toLon - fromLon;
        if (dLon > 180) dLon -= 360;
        if (dLon < -180) dLon += 360;
        const dLat = toLat - fromLat;

        // Perpendicular direction
        const len = Math.sqrt(dLat * dLat + dLon * dLon) || 1;
        const perpLat = -dLon / len;
        const perpLon = dLat / len;

        // Try nudging in both perpendicular directions
        for (let dist = 2; dist <= 20; dist += 2) {
            const lat1 = lat + perpLat * dist;
            const lon1 = lon + perpLon * dist;
            if (isWater(lat1, lon1)) return { lat: lat1, lon: lon1 };

            const lat2 = lat - perpLat * dist;
            const lon2 = lon - perpLon * dist;
            if (isWater(lat2, lon2)) return { lat: lat2, lon: lon2 };
        }
        return null;
    }

    return {
        buildFromTopology,
        isLand,
        isWater,
        generatePath,
        isReady: () => ready,
    };
})();
