/**
 * City spawner — procedural 3D city models using globe.gl objectsData.
 * Buildings scale with population tier. Region-colored with infra tint.
 * Globe.gl objectFacesSurface=true orients them outward automatically.
 */
const Spawner = (function () {

    var INFRA_COLORS = null;
    function getInfraColors() {
        if (!INFRA_COLORS) {
            INFRA_COLORS = {
                1: new THREE.Color(0x8b3a3a),
                2: new THREE.Color(0x9a7a3a),
                3: new THREE.Color(0x7a8a4a),
                4: new THREE.Color(0x4a8a6a),
                5: new THREE.Color(0x3a9a9a),
            };
        }
        return INFRA_COLORS;
    }

    /**
     * Create a procedural 3D city model as a THREE.Group.
     * Y-axis is "up" — globe.gl rotates it to face outward from the surface.
     */
    function createCityThreeObject(cityData, cityId) {
        var region = REGIONS[cityData.region];
        if (!region) return new THREE.Group();

        var tier = cityData.tier || 4;
        var infra = cityData.infra || 3;
        var infraColors = getInfraColors();

        var cityGroup = new THREE.Group();

        var regionColor = new THREE.Color(region.color);
        var infraColor = infraColors[infra] || infraColors[3];

        var buildingCount = tier === 1 ? 8 : tier === 2 ? 5 : tier === 3 ? 3 : 2;
        var maxHeight = tier === 1 ? 4 : tier === 2 ? 3 : tier === 3 ? 2 : 1.2;
        var spread = tier === 1 ? 1.5 : tier === 2 ? 1.1 : tier === 3 ? 0.8 : 0.5;

        var seed = cityId * 1337 + Math.floor(cityData.lat * 100);
        function seededRandom() {
            seed = (seed * 16807 + 0) % 2147483647;
            return (seed & 0x7fffffff) / 2147483647;
        }

        // Central building
        var centerH = maxHeight * (0.7 + seededRandom() * 0.3);
        var centerW = 0.4 + seededRandom() * 0.3;
        addBuilding(cityGroup, 0, 0, centerW, centerH, regionColor);

        // Surrounding buildings
        for (var i = 1; i < buildingCount; i++) {
            var angle = seededRandom() * Math.PI * 2;
            var dist = spread * (0.3 + seededRandom() * 0.7);
            var offX = Math.cos(angle) * dist;
            var offZ = Math.sin(angle) * dist;
            var h = maxHeight * (0.2 + seededRandom() * 0.6);
            var w = 0.25 + seededRandom() * 0.25;
            var buildColor = regionColor.clone().lerp(infraColor, 0.3 + seededRandom() * 0.4);
            addBuilding(cityGroup, offX, offZ, w, h, buildColor);
        }

        // Base platform
        var baseGeom = new THREE.CircleGeometry(spread * 1.8, 16);
        var baseMat = new THREE.MeshBasicMaterial({
            color: infraColor.clone().multiplyScalar(0.5),
            transparent: true, opacity: 0.4, side: THREE.DoubleSide,
        });
        var baseMesh = new THREE.Mesh(baseGeom, baseMat);
        baseMesh.rotation.x = -Math.PI / 2;
        cityGroup.add(baseMesh);

        return cityGroup;
    }

    function addBuilding(group, offX, offZ, width, height, color) {
        var geom = new THREE.BoxGeometry(width, height, width);
        var mat = new THREE.MeshLambertMaterial({ color: color });
        var mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(offX, height * 0.5, offZ);
        group.add(mesh);
    }

    function refreshCityObjects() {
        var st = GameState.get();
        var objects = st.activeCities.map(function(city) {
            return {
                lat: city.data.lat,
                lng: city.data.lng,
                altitude: 0.01,
                __cityId: city.id,
                __threeObject: city.__threeObject,
            };
        });
        GlobeEngine.updateCityObjects(objects);
    }

    function spawnNextCity() {
        var st = GameState.get();
        if (st.citySpawnIndex >= st.spawnQueue.length) return null;
        var cityData = st.spawnQueue[st.citySpawnIndex++];
        var city = GameState.addCity(cityData);

        city.__threeObject = createCityThreeObject(cityData, city.id);

        // Country resource bonus
        var bonus = GlobeEngine.getCountryResourcesForCity(cityData.lat, cityData.lng);
        st.resources.money += bonus.money;
        st.resources.steel += bonus.steel;
        st.resources.fuel += bonus.fuel;

        refreshCityObjects();
        return city;
    }

    function spawnInitialCities(count) {
        var cities = [];
        for (var i = 0; i < count; i++) {
            var c = spawnNextCity();
            if (c) cities.push(c);
        }
        return cities;
    }

    function updatePassengerDots(city) {
        // Badges are updated in bulk via refreshCityBadges
    }

    function refreshCityBadges() {
        var st = GameState.get();
        var badges = st.activeCities.map(function(city) {
            // Build destination color array from passengers
            var destinations = city.passengers.map(function(p) {
                var destRegion = REGIONS[p.destRegion];
                return destRegion ? destRegion.color : '#ffffff';
            });
            return {
                lat: city.data.lat,
                lng: city.data.lng,
                passengerCount: city.passengers.length,
                maxPassengers: GameState.MAX_PASSENGERS_PER_CITY,
                destinations: destinations,
                __cityId: city.id,
            };
        });
        GlobeEngine.updateCityBadges(badges);
    }

    return {
        spawnNextCity: spawnNextCity,
        spawnInitialCities: spawnInitialCities,
        refreshCityObjects: refreshCityObjects,
        updatePassengerDots: updatePassengerDots,
        refreshCityBadges: refreshCityBadges,
    };
})();
