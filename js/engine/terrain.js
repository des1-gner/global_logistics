/**
 * Terrain system — determines land vs water at any lat/lng coordinate.
 * Uses a rasterized grid sampled from the loaded TopoJSON land polygons.
 */
const Terrain = (function () {
    const GRID_W = 360;
    const GRID_H = 180;
    let landGrid = null;
    let ready = false;

    function buildFromTopology(topology) {
        landGrid = new Uint8Array(GRID_W * GRID_H);
        const land = topojson.feature(topology, topology.objects.land);

        land.features.forEach(feature => {
            const geom = feature.geometry;
            const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
            polygons.forEach(polygon => {
                const ring = polygon[0];
                rasterizePolygon(ring);
            });
        });

        ready = true;
    }

    function rasterizePolygon(ring) {
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

    function latToRow(lat) { return (90 - lat); }
    function lonToCol(lon) { return (lon + 180); }
    function rowToLat(row) { return 90 - row; }
    function colToLon(col) { return col - 180; }

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

    function isLand(lat, lng) {
        if (!ready) return false;
        const row = Math.round(latToRow(lat));
        const col = Math.round(lonToCol(lng));
        if (row < 0 || row >= GRID_H || col < 0 || col >= GRID_W) return false;
        return landGrid[row * GRID_W + col] === 1;
    }

    function isWater(lat, lng) {
        return !isLand(lat, lng);
    }

    return {
        buildFromTopology,
        isLand,
        isWater,
        isReady: () => ready,
    };
})();