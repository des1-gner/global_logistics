/**
 * Globe engine — wrapper around globe.gl library.
 * Right-click rotates, left-click is for game interaction.
 * Countries colored by infrastructure (red=poor, green=good).
 */
const GlobeEngine = (function () {
    let globeInstance = null;
    let container = null;
    let countryFeatures = [];
    let worldLoaded = false;

    let passengerGroup = null;
    let previewGroup = null;

    const OIL_COUNTRIES = [
        'Saudi Arabia', 'Russia', 'United States of America', 'Iraq', 'Iran',
        'United Arab Emirates', 'Kuwait', 'Nigeria', 'Venezuela', 'Libya',
        'Norway', 'Qatar', 'Kazakhstan', 'Brazil', 'Canada', 'Angola', 'Algeria'
    ];
    const INDUSTRIAL_COUNTRIES = [
        'China', 'United States of America', 'Japan', 'Germany', 'South Korea',
        'India', 'Italy', 'France', 'United Kingdom', 'Brazil', 'Mexico',
        'Indonesia', 'Turkey', 'Thailand', 'Taiwan', 'Poland', 'Czech Republic'
    ];

    function getCountryInfra(feature) {
        if (typeof CITY_POOL === 'undefined') return 1;
        const geom = feature.geometry;
        if (!geom) return 1;
        const polygons = geom.type === 'Polygon' ? [geom.coordinates] : (geom.type === 'MultiPolygon' ? geom.coordinates : []);
        let totalInfra = 0, count = 0;
        for (const city of CITY_POOL) {
            for (const polygon of polygons) {
                if (pointInPolygon(city.lng, city.lat, polygon[0])) {
                    totalInfra += (city.infra || 3);
                    count++;
                    break;
                }
            }
        }
        // Countries with no cities default to infra 1 (poor)
        return count > 0 ? totalInfra / count : 1;
    }

    function pointInPolygon(px, py, ring) {
        let inside = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const xi = ring[i][0], yi = ring[i][1];
            const xj = ring[j][0], yj = ring[j][1];
            if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi))
                inside = !inside;
        }
        return inside;
    }

    function infraToColor(infra) {
        const t = Math.max(0, Math.min(1, (infra - 1) / 4));
        const r = Math.round(t < 0.5 ? 180 : 180 - (t - 0.5) * 240);
        const g = Math.round(t < 0.5 ? 60 + t * 200 : 160 + (t - 0.5) * 60);
        const b = Math.round(40 + t * 20);
        return 'rgba(' + r + ',' + g + ',' + b + ',0.75)';
    }

    function infraToSideColor(infra) {
        const t = Math.max(0, Math.min(1, (infra - 1) / 4));
        const r = Math.round(t < 0.5 ? 120 : 120 - (t - 0.5) * 160);
        const g = Math.round(t < 0.5 ? 40 + t * 130 : 105 + (t - 0.5) * 40);
        const b = Math.round(30 + t * 15);
        return 'rgba(' + r + ',' + g + ',' + b + ',0.5)';
    }

    function getCountryResources(countryName) {
        const resources = { money: 5, steel: 1, fuel: 1 };
        if (OIL_COUNTRIES.includes(countryName)) { resources.fuel += 4; resources.money += 3; }
        if (INDUSTRIAL_COUNTRIES.includes(countryName)) { resources.steel += 4; resources.money += 2; }
        return resources;
    }

    function init(containerEl) {
        container = containerEl;

        globeInstance = Globe()(containerEl)
            .backgroundColor('#050510')
            .showGlobe(true)
            .showAtmosphere(true)
            .atmosphereColor('#2244aa')
            .atmosphereAltitude(0.15)
            .showGraticules(true)
            // Countries
            .polygonAltitude(0.006)
            .polygonCapColor(function(feat) { return feat.__capColor || 'rgba(180,60,40,0.75)'; })
            .polygonSideColor(function(feat) { return feat.__sideColor || 'rgba(120,40,30,0.5)'; })
            .polygonStrokeColor(function() { return '#222'; })
            .polygonLabel(function() { return null; })
            // Forward polygon clicks to waypoint handler
            .onPolygonClick(function(polygon, event, coords) {
                // coords has { lat, lng, altitude }
                if (Controls.isDrawing()) {
                    Controls.handleWaypointClick(coords.lat, coords.lng);
                }
            })
            // 3D city objects
            .objectLat(function(d) { return d.lat; })
            .objectLng(function(d) { return d.lng; })
            .objectAltitude(0.012)
            .objectThreeObject(function(d) { return d.__threeObject ? d.__threeObject.clone(true) : new THREE.Mesh(); })
            .objectLabel(function() { return null; })
            // Plane arcs
            .arcStartLat(function(d) { return d.startLat; })
            .arcStartLng(function(d) { return d.startLng; })
            .arcEndLat(function(d) { return d.endLat; })
            .arcEndLng(function(d) { return d.endLng; })
            .arcColor(function(d) { return d.color; })
            .arcAltitudeAutoScale(0.4)
            .arcStroke(0.8)
            .arcDashLength(0.4)
            .arcDashGap(0.2)
            .arcDashAnimateTime(2000)
            .arcLabel(function() { return null; })
            // Train/boat paths
            .pathPoints(function(d) { return d.points; })
            .pathPointLat(function(p) { return p[0]; })
            .pathPointLng(function(p) { return p[1]; })
            .pathPointAlt(function(p) { return p[2] || 0.006; })
            .pathColor(function(d) { return d.color; })
            .pathStroke(3)
            .pathDashLength(0.3)
            .pathDashGap(0.1)
            .pathDashAnimateTime(3000)
            .pathTransitionDuration(0)
            .pathLabel(function() { return null; })
            // Disable default transitions for snappy updates
            .arcsTransitionDuration(0)
            // HTML elements for passenger count badges
            .htmlLat(function(d) { return d.lat; })
            .htmlLng(function(d) { return d.lng; })
            .htmlAltitude(0.03)
            .htmlElement(function(d) {
                var el = d.__htmlEl;
                if (!el) {
                    el = document.createElement('div');
                    el.className = 'city-badge';
                    d.__htmlEl = el;
                }
                var count = d.passengerCount || 0;
                var max = d.maxPassengers || 6;
                if (count === 0) {
                    el.style.display = 'none';
                    return el;
                }
                el.style.display = '';
                // Color: green when low, yellow mid, red when near overflow
                var ratio = count / max;
                var bg = ratio > 0.8 ? '#ef4444' : ratio > 0.5 ? '#f59e0b' : '#22c55e';
                el.style.cssText = 'background:' + bg + ';color:#fff;font-size:10px;font-weight:700;' +
                    'padding:2px 5px;border-radius:8px;text-align:center;pointer-events:none;' +
                    'min-width:16px;line-height:14px;box-shadow:0 0 4px rgba(0,0,0,0.5);' +
                    'font-family:-apple-system,sans-serif;display:flex;align-items:center;gap:3px;';

                // Build badge content: count + destination dots
                var html = '<span class="badge-count">' + count + '</span>';
                var destinations = d.destinations;
                if (destinations && destinations.length > 0) {
                    html += '<div class="badge-dots" style="display:flex;gap:1px;flex-wrap:wrap;max-width:40px;">';
                    for (var i = 0; i < destinations.length; i++) {
                        html += '<span style="background:' + destinations[i] + ';width:5px;height:5px;border-radius:1px;display:inline-block;"></span>';
                    }
                    html += '</div>';
                }
                el.innerHTML = html;

                // Pulse animation when nearly full
                if (ratio > 0.8) {
                    el.style.animation = 'pulse-badge 0.6s infinite alternate';
                } else {
                    el.style.animation = '';
                }
                return el;
            })
            .htmlTransitionDuration(0);

        // Set initial camera
        globeInstance.pointOfView({ lat: 30, lng: 0, altitude: 2.5 });

        // Set ocean to light blue with subtle shading
        var globeMat = globeInstance.globeMaterial();
        if (globeMat) {
            globeMat.color = new THREE.Color(0x1a5276);
            globeMat.emissive = new THREE.Color(0x0a2a3f);
            globeMat.emissiveIntensity = 0.4;
            globeMat.shininess = 25;
            if (globeMat.specular) globeMat.specular = new THREE.Color(0x3a8abf);
        }

        // Swap mouse buttons: right-click to rotate, left-click for game
        var controls = globeInstance.controls();
        if (controls) {
            // OrbitControls mouseButtons: LEFT=ROTATE(0), MIDDLE=DOLLY(1), RIGHT=PAN(2)
            // We want: LEFT=nothing, RIGHT=ROTATE
            controls.mouseButtons = { LEFT: undefined, MIDDLE: 1, RIGHT: 0 };
            controls.enablePan = false;
        }

        // Custom THREE groups
        const scene = globeInstance.scene();
        passengerGroup = new THREE.Group();
        scene.add(passengerGroup);
        previewGroup = new THREE.Group();
        scene.add(previewGroup);

        // Stars
        const starsGeom = new THREE.BufferGeometry();
        const sp = [];
        for (let i = 0; i < 4000; i++)
            sp.push((Math.random()-0.5)*800,(Math.random()-0.5)*800,(Math.random()-0.5)*800);
        starsGeom.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
        scene.add(new THREE.Points(starsGeom, new THREE.PointsMaterial({
            color: 0xccddff, size: 0.3, transparent: true, opacity: 0.35
        })));

        loadCountryData();
        return globeInstance;
    }

    function loadCountryData() {
        fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(function(r) { return r.json(); })
            .then(function(geojson) {
                countryFeatures = geojson.features.map(function(feat) {
                    const infra = getCountryInfra(feat);
                    feat.__capColor = infraToColor(infra);
                    feat.__sideColor = infraToSideColor(infra);
                    feat.__infra = infra;
                    feat.__resources = getCountryResources(feat.properties.ADMIN || feat.properties.NAME || '');
                    return feat;
                });
                globeInstance.polygonsData(countryFeatures.filter(function(d) {
                    return d.properties.ISO_A2 !== 'AQ'; // skip Antarctica
                }));
                worldLoaded = true;
                var loadEl = document.getElementById('loading');
                if (loadEl) loadEl.style.display = 'none';
            })
            .catch(function(err) {
                console.error('Country data load failed:', err);
                worldLoaded = true;
                var loadEl = document.getElementById('loading');
                if (loadEl) { loadEl.textContent = 'Map failed'; setTimeout(function() { loadEl.style.display = 'none'; }, 2000); }
            });

        // Terrain grid
        fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
            .then(function(r) { return r.json(); })
            .then(function(topology) { Terrain.buildFromTopology(topology); })
            .catch(function(err) { console.warn('Terrain load failed:', err); });
    }

    function getCountryResourcesForCity(lat, lng) {
        if (!countryFeatures.length) return { money: 5, steel: 1, fuel: 1 };
        for (var i = 0; i < countryFeatures.length; i++) {
            var feat = countryFeatures[i];
            var geom = feat.geometry;
            if (!geom) continue;
            var polygons = geom.type === 'Polygon' ? [geom.coordinates] : (geom.type === 'MultiPolygon' ? geom.coordinates : []);
            for (var j = 0; j < polygons.length; j++) {
                if (pointInPolygon(lng, lat, polygons[j][0])) {
                    return feat.__resources || { money: 5, steel: 1, fuel: 1 };
                }
            }
        }
        return { money: 5, steel: 1, fuel: 1 };
    }

    function updateCityObjects(data) { if (globeInstance) globeInstance.objectsData(data); }
    function updateArcs(data) { if (globeInstance) globeInstance.arcsData(data); }
    function updatePaths(data) { if (globeInstance) globeInstance.pathsData(data); }
    function updateCityBadges(data) { if (globeInstance) globeInstance.htmlElementsData(data); }

    return {
        init: init,
        getGlobe: function() { return globeInstance; },
        getScene: function() { return globeInstance ? globeInstance.scene() : null; },
        getCamera: function() { return globeInstance ? globeInstance.camera() : null; },
        getRenderer: function() { return globeInstance ? globeInstance.renderer() : null; },
        getPassengerGroup: function() { return passengerGroup; },
        getPreviewGroup: function() { return previewGroup; },
        updateCityObjects: updateCityObjects,
        updateArcs: updateArcs,
        updatePaths: updatePaths,
        updateCityBadges: updateCityBadges,
        isWorldLoaded: function() { return worldLoaded; },
        getCountryFeatures: function() { return countryFeatures; },
        getCountryResourcesForCity: getCountryResourcesForCity,
    };
})();
