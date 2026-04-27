/**
 * Input controls — mouse drag, zoom, keyboard, tool selection.
 * Planes: click city A, click city B → connect.
 * Trains/Boats: click cities in sequence to draw a line (polyline mode).
 *   Double-click or press Enter/Escape to finish the line.
 *   Each consecutive pair in the polyline becomes a connection.
 * Delete: click city A, click city B → remove connection between them.
 */
const Controls = (function () {
    let isDragging = false;
    let previousMouse = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };
    let targetRotation = { x: 0.5, y: -0.3 };
    let dragDistance = 0;
    let hoveredCity = null;

    // Polyline drawing state for trains/boats
    let polylineCities = [];  // cities clicked in sequence

    function init() {
        const canvas = GlobeEngine.getRenderer().domElement;

        canvas.addEventListener('mousedown', e => {
            isDragging = true;
            dragDistance = 0;
            previousMouse = { x: e.clientX, y: e.clientY };
        });

        canvas.addEventListener('mousemove', e => {
            const st = GameState.get();
            if (!st.running) return;

            if (isDragging) {
                const dx = e.clientX - previousMouse.x;
                const dy = e.clientY - previousMouse.y;
                dragDistance += Math.abs(dx) + Math.abs(dy);
                targetRotation.y += dx * 0.005;
                targetRotation.x += dy * 0.005;
                targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.x));
                rotationVelocity = { x: dy * 0.005, y: dx * 0.005 };
                previousMouse = { x: e.clientX, y: e.clientY };
                Tooltip.hide();
            } else {
                const city = Picker.getIntersectedCity(e, GlobeEngine.getCamera(), GlobeEngine.getMarkerGroup(), st.activeCities);
                if (city) {
                    Tooltip.show(city, e.clientX, e.clientY);
                    canvas.style.cursor = 'pointer';
                    if (hoveredCity && hoveredCity.id !== city.id) highlightCity(hoveredCity, false);
                    highlightCity(city, true);
                    hoveredCity = city;
                } else {
                    Tooltip.hide();
                    canvas.style.cursor = 'grab';
                    if (hoveredCity) highlightCity(hoveredCity, false);
                    hoveredCity = null;
                }
            }
        });

        canvas.addEventListener('mouseup', e => {
            const wasDrag = dragDistance > 5;
            isDragging = false;
            if (!wasDrag) handleClick(e);
        });

        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            Tooltip.hide();
        });

        // Touch
        canvas.addEventListener('touchstart', e => {
            isDragging = true; dragDistance = 0;
            previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });
        canvas.addEventListener('touchmove', e => {
            if (!isDragging) return; e.preventDefault();
            const dx = e.touches[0].clientX - previousMouse.x;
            const dy = e.touches[0].clientY - previousMouse.y;
            dragDistance += Math.abs(dx) + Math.abs(dy);
            targetRotation.y += dx * 0.005;
            targetRotation.x += dy * 0.005;
            targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.x));
            previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }, { passive: false });
        canvas.addEventListener('touchend', e => {
            const wasDrag = dragDistance > 10;
            isDragging = false;
            if (!wasDrag && e.changedTouches.length > 0) handleClick(e.changedTouches[0]);
        });

        // Zoom
        canvas.addEventListener('wheel', e => {
            const cam = GlobeEngine.getCamera();
            cam.position.z = Math.max(1.5, Math.min(8, cam.position.z + e.deltaY * 0.002));
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
                case 'Enter':
                    finishPolyline();
                    break;
            }
        });

        // Transport bar buttons
        document.querySelectorAll('.transport-btn').forEach(btn => {
            btn.addEventListener('click', () => selectTool(btn.dataset.type));
        });
    }

    function selectTool(type) {
        const st = GameState.get();
        // Finish any in-progress polyline before switching
        finishPolyline();
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
        if (st.selectedTool === 'train' || st.selectedTool === 'boat') {
            hint.textContent = 'Click cities in sequence to draw a line · Press Esc/Enter to finish · 1/2/3/X to switch';
        } else if (st.selectedTool === 'delete') {
            hint.textContent = 'Click two connected cities to remove the connection · 1/2/3/X to switch';
        } else {
            hint.textContent = 'Click two cities to connect with a plane · 1/2/3/X to switch';
        }
    }

    function handleClick(e) {
        const st = GameState.get();
        if (!st.running) return;

        const city = Picker.getIntersectedCity(e, GlobeEngine.getCamera(), GlobeEngine.getMarkerGroup(), st.activeCities);
        if (!city) {
            // Clicked empty space — finish polyline if drawing
            if (polylineCities.length > 0) finishPolyline();
            st.pendingConnection = null;
            return;
        }

        const tool = st.selectedTool;

        if (tool === 'delete') {
            handleDeleteClick(city, st);
            return;
        }

        if (tool === 'plane') {
            handlePlaneClick(city, st);
            return;
        }

        // Train or Boat: polyline mode
        handlePolylineClick(city, st, tool);
    }

    function handlePlaneClick(city, st) {
        if (!st.pendingConnection) {
            st.pendingConnection = { fromCity: city };
            highlightCity(city, true);
        } else {
            if (st.pendingConnection.fromCity.id !== city.id) {
                const result = Connections.connect(st.pendingConnection.fromCity, city, 'plane');
                if (!result.ok) console.log('Cannot connect:', result.reason);
            }
            st.pendingConnection = null;
        }
    }

    function handlePolylineClick(city, st, tool) {
        // Don't add the same city twice in a row
        if (polylineCities.length > 0 && polylineCities[polylineCities.length - 1].id === city.id) return;

        // If we have a previous city, connect it to this one
        if (polylineCities.length > 0) {
            const prevCity = polylineCities[polylineCities.length - 1];
            const result = Connections.connect(prevCity, city, tool);
            if (!result.ok) {
                console.log('Cannot connect:', result.reason);
                return; // Don't add to polyline if connection failed
            }
        }

        polylineCities.push(city);
        highlightCity(city, true);
    }

    function finishPolyline() {
        // Clear highlights
        polylineCities.forEach(c => highlightCity(c, false));
        polylineCities = [];
    }

    function handleDeleteClick(city, st) {
        if (!st.pendingConnection) {
            st.pendingConnection = { fromCity: city };
            highlightCity(city, true);
        } else {
            if (st.pendingConnection.fromCity.id !== city.id) {
                const conn = GameState.findConnection(st.pendingConnection.fromCity, city);
                if (conn) Connections.disconnect(conn.id);
            }
            highlightCity(st.pendingConnection.fromCity, false);
            st.pendingConnection = null;
        }
    }

    function highlightCity(city, on) {
        if (city.ring) city.ring.material.opacity = on ? 0.5 : 0.0;
    }

    function updateRotation(dt) {
        if (!isDragging) {
            rotationVelocity.x *= 0.95;
            rotationVelocity.y *= 0.95;
            targetRotation.x += rotationVelocity.x * 0.1;
            targetRotation.y += rotationVelocity.y * 0.1;
        }

        const globe = GlobeEngine.getGlobe();
        const rx = globe.rotation.x + (targetRotation.x - globe.rotation.x) * 0.06;
        const ry = globe.rotation.y + (targetRotation.y - globe.rotation.y) * 0.06;
        GlobeEngine.syncRotation(rx, ry);
    }

    return { init, updateRotation, selectTool };
})();
