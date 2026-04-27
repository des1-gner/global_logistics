/**
 * City spawner — progressively adds cities to the globe.
 * Smaller markers and labels to fit more cities on screen.
 */
const Spawner = (function () {
    const R = GlobeEngine.GLOBE_RADIUS;
    const MARKER_SIZE = 0.011;  // smaller markers

    function createCityMarker(city) {
        const region = REGIONS[city.data.region];
        if (!region) return;

        const color = new THREE.Color(region.color);
        const pos = GlobeEngine.latLonToVec3(city.data.lat, city.data.lon, R * 1.006);

        // Shape mesh
        const shapeName = region.shape || 'circle';
        const builder = SHAPE_BUILDERS[shapeName] || SHAPE_BUILDERS.circle;
        const shape = builder(MARKER_SIZE);
        const extrudeSettings = { depth: 0.002, bevelEnabled: false };
        const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.copy(pos);
        mesh.lookAt(new THREE.Vector3(0, 0, 0));
        mesh.rotateZ(Math.PI);
        mesh.userData.cityId = city.id;
        city.mesh = mesh;
        GlobeEngine.getMarkerGroup().add(mesh);

        // Hover ring (invisible until hovered)
        const ringGeom = new THREE.RingGeometry(MARKER_SIZE * 1.3, MARKER_SIZE * 1.7, 24);
        const ringMat = new THREE.MeshBasicMaterial({
            color, transparent: true, opacity: 0.0, side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.copy(pos);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        ring.userData.isRing = true;
        ring.userData.cityId = city.id;
        city.ring = ring;
        GlobeEngine.getMarkerGroup().add(ring);

        // Label sprite — smaller text
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256; canvas.height = 48;
        ctx.font = 'bold 18px -apple-system, sans-serif';
        ctx.fillStyle = region.color;
        ctx.textAlign = 'center';
        ctx.fillText(city.data.name, 128, 30);
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.75 });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.copy(GlobeEngine.latLonToVec3(city.data.lat, city.data.lon, R * 1.04));
        sprite.scale.set(0.16, 0.03, 1);  // smaller labels
        city.labelSprite = sprite;
        GlobeEngine.getMarkerGroup().add(sprite);
    }

    function spawnNextCity() {
        const st = GameState.get();
        if (st.citySpawnIndex >= st.spawnQueue.length) return null;

        const cityData = st.spawnQueue[st.citySpawnIndex++];
        const city = GameState.addCity(cityData);
        createCityMarker(city);
        return city;
    }

    function spawnInitialCities(count) {
        const cities = [];
        for (let i = 0; i < count; i++) {
            const c = spawnNextCity();
            if (c) cities.push(c);
        }
        return cities;
    }

    function updatePassengerDots(city) {
        if (!city.mesh) return;

        // Remove old dots
        city.passengerDots.forEach(d => {
            GlobeEngine.getMarkerGroup().remove(d);
            if (d.geometry) d.geometry.dispose();
            if (d.material) d.material.dispose();
        });
        city.passengerDots = [];

        const pos = city.mesh.position.clone();
        const normal = pos.clone().normalize();

        city.passengers.forEach((p, i) => {
            const angle = (i / Math.max(city.passengers.length, 1)) * Math.PI * 2;
            const offset = 0.02;  // tighter orbit

            const dotGeom = new THREE.SphereGeometry(0.003, 5, 5);  // smaller dots
            const dotMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color) });
            const dot = new THREE.Mesh(dotGeom, dotMat);

            const tangent = new THREE.Vector3(0, 1, 0).cross(normal).normalize();
            const bitangent = normal.clone().cross(tangent).normalize();
            dot.position.copy(pos)
                .add(tangent.clone().multiplyScalar(Math.cos(angle) * offset))
                .add(bitangent.clone().multiplyScalar(Math.sin(angle) * offset));

            city.passengerDots.push(dot);
            GlobeEngine.getMarkerGroup().add(dot);
        });
    }

    return { spawnNextCity, spawnInitialCities, createCityMarker, updatePassengerDots };
})();
