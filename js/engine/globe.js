/**
 * Globe rendering — sphere, filled countries with random shades, borders, atmosphere.
 * Triggers Terrain grid build once topology loads.
 */
const GlobeEngine = (function () {
    const GLOBE_RADIUS = 1;
    let scene, camera, renderer, globe;
    let landGroup, markerGroup, arcGroup, passengerGroup;
    let worldLoaded = false;

    function latLonToVec3(lat, lon, r) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (lon + 180) * Math.PI / 180;
        return new THREE.Vector3(
            -r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
        );
    }

    function init(container) {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 3.2);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0x667799, 2.0));
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(5, 3, 5);
        scene.add(dir);
        const dir2 = new THREE.DirectionalLight(0x6688bb, 0.4);
        dir2.position.set(-4, -2, -3);
        scene.add(dir2);

        // Ocean
        const globeGeom = new THREE.SphereGeometry(GLOBE_RADIUS, 80, 80);
        globe = new THREE.Mesh(globeGeom, new THREE.MeshPhongMaterial({
            color: 0x0b1a30, emissive: 0x050e1c, specular: 0x1a3060, shininess: 30,
        }));
        scene.add(globe);

        // Atmosphere
        const atmosGeom = new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 64, 64);
        scene.add(new THREE.Mesh(atmosGeom, new THREE.MeshBasicMaterial({
            color: 0x4488ff, transparent: true, opacity: 0.045, side: THREE.BackSide
        })));

        landGroup = new THREE.Group(); scene.add(landGroup);
        markerGroup = new THREE.Group(); scene.add(markerGroup);
        arcGroup = new THREE.Group(); scene.add(arcGroup);
        passengerGroup = new THREE.Group(); scene.add(passengerGroup);

        // Stars
        const starsGeom = new THREE.BufferGeometry();
        const sp = [];
        for (let i = 0; i < 3000; i++) sp.push((Math.random()-0.5)*140,(Math.random()-0.5)*140,(Math.random()-0.5)*140);
        starsGeom.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
        scene.add(new THREE.Points(starsGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.45 })));

        loadLandData();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        return { scene, camera, renderer };
    }

    function triangulateSpherePolygon(ring, radius) {
        if (ring.length < 4) return null;
        const vertices = [], indices = [];
        const n = ring.length - 1;
        for (let i = 0; i < n; i++) {
            const [lon, lat] = ring[i];
            const v = latLonToVec3(lat, lon, radius);
            vertices.push(v.x, v.y, v.z);
        }
        for (let i = 1; i < n - 1; i++) indices.push(0, i, i + 1);
        if (vertices.length < 9 || indices.length < 3) return null;
        return { vertices: new Float32Array(vertices), indices };
    }

    /** Generate a random earthy green/brown shade for a country */
    function randomCountryColor(seed) {
        // Seeded pseudo-random from country id
        let h = seed;
        h = ((h >> 16) ^ h) * 0x45d9f3b;
        h = ((h >> 16) ^ h) * 0x45d9f3b;
        h = (h >> 16) ^ h;
        const r = (h & 0xFF) / 255;

        // Green-brown palette: hue 80-160, low saturation, low lightness
        const hue = 80 + r * 80;           // 80-160 (green to teal)
        const sat = 0.2 + (r * 0.3);       // 20-50%
        const lit = 0.10 + (r * 0.12);     // 10-22%
        return new THREE.Color().setHSL(hue / 360, sat, lit);
    }

    function loadLandData() {
        fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
            .then(r => r.json())
            .then(topology => {
                const landR = GLOBE_RADIUS * 1.0008;
                const borderR = GLOBE_RADIUS * 1.0012;

                // Build terrain grid
                Terrain.buildFromTopology(topology);

                // ── Fill each country with a unique shade ──
                if (topology.objects.countries) {
                    const countries = topojson.feature(topology, topology.objects.countries);
                    countries.features.forEach((feature, idx) => {
                        const geom = feature.geometry;
                        if (!geom) return;
                        const countryId = feature.id || idx;
                        const color = randomCountryColor(countryId * 7 + 13);
                        const mat = new THREE.MeshPhongMaterial({
                            color, emissive: color.clone().multiplyScalar(0.4),
                            specular: 0x1a2a1a, shininess: 8, side: THREE.DoubleSide,
                        });

                        const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
                        polygons.forEach(polygon => {
                            const tri = triangulateSpherePolygon(polygon[0], landR);
                            if (!tri) return;
                            const meshGeom = new THREE.BufferGeometry();
                            meshGeom.setAttribute('position', new THREE.BufferAttribute(tri.vertices, 3));
                            meshGeom.setIndex(tri.indices);
                            meshGeom.computeVertexNormals();
                            landGroup.add(new THREE.Mesh(meshGeom, mat));
                        });

                        // Country borders
                        const borderMat = new THREE.LineBasicMaterial({ color: 0x3a6a4a, transparent: true, opacity: 0.4 });
                        polygons.forEach(polygon => {
                            polygon.forEach(ring => {
                                const points = ring.map(([lon, lat]) => latLonToVec3(lat, lon, borderR));
                                landGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), borderMat));
                            });
                        });
                    });
                }

                // Coastlines (brighter)
                const land = topojson.feature(topology, topology.objects.land);
                const coastMat = new THREE.LineBasicMaterial({ color: 0x4a8a5a, transparent: true, opacity: 0.6 });
                land.features.forEach(feature => {
                    const geom = feature.geometry;
                    const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
                    polygons.forEach(polygon => {
                        polygon.forEach(ring => {
                            const points = ring.map(([lon, lat]) => latLonToVec3(lat, lon, borderR * 1.0003));
                            landGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), coastMat));
                        });
                    });
                });

                // Graticule
                const gratMat = new THREE.LineBasicMaterial({ color: 0x182838, transparent: true, opacity: 0.1 });
                for (let lat = -60; lat <= 60; lat += 30) {
                    const pts = [];
                    for (let lon = -180; lon <= 180; lon += 3) pts.push(latLonToVec3(lat, lon, GLOBE_RADIUS * 1.0015));
                    landGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gratMat));
                }

                worldLoaded = true;
                const loadEl = document.getElementById('loading');
                if (loadEl) loadEl.style.display = 'none';
            })
            .catch(err => {
                console.error('Land data load failed:', err);
                const loadEl = document.getElementById('loading');
                if (loadEl) { loadEl.textContent = 'Map failed — game still works!'; setTimeout(() => loadEl.style.display = 'none', 2000); }
                worldLoaded = true;
            });
    }

    function syncRotation(rx, ry) {
        globe.rotation.x = rx; globe.rotation.y = ry;
        landGroup.rotation.x = rx; landGroup.rotation.y = ry;
        markerGroup.rotation.x = rx; markerGroup.rotation.y = ry;
        arcGroup.rotation.x = rx; arcGroup.rotation.y = ry;
        passengerGroup.rotation.x = rx; passengerGroup.rotation.y = ry;
    }

    function render() { renderer.render(scene, camera); }

    return {
        init, render, syncRotation, latLonToVec3,
        getScene: () => scene, getCamera: () => camera, getRenderer: () => renderer,
        getGlobe: () => globe, getMarkerGroup: () => markerGroup,
        getArcGroup: () => arcGroup, getPassengerGroup: () => passengerGroup,
        GLOBE_RADIUS, isWorldLoaded: () => worldLoaded,
    };
})();
