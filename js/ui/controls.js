/**
 * Input controls — uses globe.gl native click/hover handlers.
 * Left-click on cities to start/finish routes.
 * Left-click on globe surface to place waypoints for train/boat routes.
 * Planes are direct arcs. Keyboard shortcuts for tool selection.
 */
const Controls = (function () {
    let hoveredCity = null;

    // Route drawing state for trains/boats
    let drawingRoute = false;
    let drawStartCity = null;
    let drawWaypoints = [];
    let drawPreviewMeshes = [];

    function init() {
        const globe = GlobeEngine.getGlobe();
        if (!globe) { console.warn('Globe not ready for controls'); return; }

        // Prevent context menu on right-click (so right-drag rotation works)
        document.getElementById('globe-container').addEventListener('contextmenu', function(e) { e.preventDefault(); });

        // City click handler (via objectsData)
        globe.onObjectClick((obj, event) => {
            const st = GameState.get();
            if (!st.running) return;
            const city = st.activeCities.find(c => c.id === obj.__cityId);
            if (!city) return;
            handleCityClick(city, event);
        });

        // Globe surface click handler (for waypoints on ocean)
        globe.onGlobeClick(({ lat, lng }, event) => {
            const st = GameState.get();
            if (!st.running) return;
            handleGlobeClick(lat, lng, event);
        });

        // City hover handler
        globe.onObjectHover((obj, prevObj) => {
            const st = GameState.get();
            if (!st.running) return;

            if (obj) {
                const city = st.activeCities.find(c => c.id === obj.__cityId);
                if (city) {
                    // Get mouse position from the last known event
                    const container = document.getElementById('globe-container');
                    const rect = container.getBoundingClientRect();
                    // Use globe's internal mouse tracking
                    Tooltip.show(city, lastMouseX, lastMouseY);
                    hoveredCity = city;
                }
            } else {
                Tooltip.hide();
                hoveredCity = null;
            }
        });

        // Track mouse position for tooltip
        document.getElementById('globe-container').addEventListener('mousemove', e => {
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            if (hoveredCity) {
                Tooltip.show(hoveredCity, e.clientX, e.clientY);
            }
        });

        // Keyboard
        document.addEventListener('keydown', e => {
            const st = GameState.get();
            if (!st.running) return;
            switch (e.key) {
                case '1': selectTool('train'); break;
                case '2': selectTool('plane'); break;
                case '3': selectTool('boat'); break;
                case 'x': case 'X': selectTool('delete'); break;
                case 'Escape':
                    cancelDrawing();
                    break;
            }
        });

        // Transport bar buttons
        document.querySelectorAll('.transport-btn').forEach(btn => {
            btn.addEventListener('click', () => selectTool(btn.dataset.type));
        });
    }

    let lastMouseX = 0, lastMouseY = 0;

    function selectTool(type) {
        const st = GameState.get();
        cancelDrawing();
        st.selectedTool = type;
        st.pendingConnection = null;

        document.querySelectorAll('.transport-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        updateHint();
    }

    function updateHint() {
        const st = GameState.get();
        const hint = document.getElementById('controls-hint');
        if (st.selectedTool === 'train') {
            if (drawingRoute) {
                hint.textContent = 'Click globe to add waypoints \u00B7 Click a city to finish \u00B7 Esc to cancel';
            } else {
                hint.textContent = 'Click a city to start \u00B7 Draw waypoints to route around water \u00B7 Right-drag to rotate';
            }
        } else if (st.selectedTool === 'boat') {
            if (drawingRoute) {
                hint.textContent = 'Click globe to add waypoints \u00B7 Click a city to finish \u00B7 Esc to cancel';
            } else {
                hint.textContent = 'Click a city to start \u00B7 Draw waypoints to route around land \u00B7 Right-drag to rotate';
            }
        } else if (st.selectedTool === 'delete') {
            hint.textContent = 'Click two connected cities to remove the connection \u00B7 1/2/3/X to switch';
        } else {
            hint.textContent = 'Click two cities to connect with a plane \u00B7 Right-drag to rotate \u00B7 Scroll to zoom';
        }
    }

    function handleCityClick(city, event) {
        const st = GameState.get();
        const tool = st.selectedTool;

        if (tool === 'delete') {
            handleDeleteClick(city, st);
            return;
        }

        if (tool === 'plane') {
            handlePlaneClick(city, st);
            return;
        }

        // Train or Boat: route drawing mode
        handleRouteDrawCityClick(city, st, tool);
    }

    function handleGlobeClick(lat, lng, event) {
        const st = GameState.get();
        const tool = st.selectedTool;

        if (tool === 'plane' || tool === 'delete') {
            // Clicked empty space — deselect pending
            if (st.pendingConnection) {
                st.pendingConnection = null;
            }
            return;
        }

        // Train or Boat: add waypoint if drawing
        if (tool === 'train' || tool === 'boat') {
            if (drawingRoute) {
                drawWaypoints.push({ lat, lng });
                Sound.waypoint();
                updateDrawPreview(tool);
            }
        }
    }

    /**
     * Handle waypoint placement from polygon clicks (countries).
     * Called from globe.js onPolygonClick when drawing a route.
     */
    function handleWaypointClick(lat, lng) {
        var st = GameState.get();
        if (!st.running) return;
        var tool = st.selectedTool;
        if (tool === 'train' || tool === 'boat') {
            if (drawingRoute) {
                drawWaypoints.push({ lat: lat, lng: lng });
                Sound.waypoint();
                updateDrawPreview(tool);
            }
        }
    }

    function handlePlaneClick(city, st) {
        if (!st.pendingConnection) {
            st.pendingConnection = { fromCity: city };
            Sound.click();
        } else {
            if (st.pendingConnection.fromCity.id !== city.id) {
                const result = Connections.connect(st.pendingConnection.fromCity, city, 'plane');
                if (!result.ok) {
                    document.getElementById('controls-hint').textContent = '\u26A0 ' + result.reason;
                    Sound.error();
                } else {
                    Sound.planeWhoosh();
                }
            }
            st.pendingConnection = null;
        }
    }

    function handleRouteDrawCityClick(city, st, tool) {
        if (!drawingRoute) {
            // Start drawing
            drawingRoute = true;
            drawStartCity = city;
            drawWaypoints = [{ lat: city.data.lat, lng: city.data.lng }];
            Sound.drawStart();
            updateHint();
            return;
        }

        // Already drawing — clicked a city to finish
        if (city.id === drawStartCity.id) return;

        drawWaypoints.push({ lat: city.data.lat, lng: city.data.lng });

        const result = Connections.connectWithWaypoints(drawStartCity, city, tool, drawWaypoints);
        if (!result.ok) {
            document.getElementById('controls-hint').textContent = '\u26A0 ' + result.reason;
            Sound.error();
        } else {
            Sound.buildComplete();
            if (tool === 'train') Sound.trainHorn();
            else if (tool === 'boat') Sound.boatHorn();
        }

        finishDrawing();
    }

    function updateDrawPreview(tool) {
        clearDrawPreview();

        if (drawWaypoints.length < 2) return;

        const globe = GlobeEngine.getGlobe();
        const previewGroup = GlobeEngine.getPreviewGroup();
        const color = tool === 'train' ? 0x4ade80 : 0x38bdf8;

        // Build preview line through all waypoints
        const points = [];
        for (let i = 0; i < drawWaypoints.length - 1; i++) {
            const from = drawWaypoints[i];
            const to = drawWaypoints[i + 1];
            const segPoints = interpolateSegment(from, to, globe, 20);
            if (i > 0 && points.length > 0) segPoints.shift();
            points.push(...segPoints);
        }

        if (points.length >= 2) {
            const geom = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineDashedMaterial({
                color, transparent: true, opacity: 0.7,
                dashSize: 1.5, gapSize: 0.8,
            });
            const line = new THREE.Line(geom, mat);
            line.computeLineDistances();
            previewGroup.add(line);
            drawPreviewMeshes.push(line);
        }

        // Draw waypoint markers
        drawWaypoints.forEach((wp, i) => {
            if (i === 0) return;
            const coords = globe.getCoords(wp.lat, wp.lng, 0.01);
            if (!coords) return;
            const dotGeom = new THREE.SphereGeometry(0.4, 8, 8);
            const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
            const dot = new THREE.Mesh(dotGeom, dotMat);
            dot.position.set(coords.x, coords.y, coords.z);
            previewGroup.add(dot);
            drawPreviewMeshes.push(dot);
        });
    }

    function interpolateSegment(from, to, globe, steps) {
        const points = [];
        let dLng = to.lng - from.lng;
        if (dLng > 180) dLng -= 360;
        if (dLng < -180) dLng += 360;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const lat = from.lat + (to.lat - from.lat) * t;
            let lng = from.lng + dLng * t;
            if (lng > 180) lng -= 360;
            if (lng < -180) lng += 360;
            const coords = globe.getCoords(lat, lng, 0.008);
            if (coords) {
                points.push(new THREE.Vector3(coords.x, coords.y, coords.z));
            }
        }
        return points;
    }

    function clearDrawPreview() {
        const previewGroup = GlobeEngine.getPreviewGroup();
        drawPreviewMeshes.forEach(m => {
            previewGroup.remove(m);
            if (m.geometry) m.geometry.dispose();
            if (m.material) m.material.dispose();
        });
        drawPreviewMeshes = [];
    }

    function finishDrawing() {
        clearDrawPreview();
        drawingRoute = false;
        drawStartCity = null;
        drawWaypoints = [];
        updateHint();
    }

    function cancelDrawing() {
        if (drawingRoute) Sound.cancel();
        finishDrawing();
    }

    function handleDeleteClick(city, st) {
        if (!st.pendingConnection) {
            st.pendingConnection = { fromCity: city };
            Sound.click();
        } else {
            if (st.pendingConnection.fromCity.id !== city.id) {
                const conn = GameState.findConnection(st.pendingConnection.fromCity, city);
                if (conn) {
                    Connections.disconnect(conn.id);
                    Sound.remove();
                }
            }
            st.pendingConnection = null;
        }
    }

    function isDrawing() { return drawingRoute; }

    return { init, selectTool, isDrawing, handleWaypointClick };
})();
