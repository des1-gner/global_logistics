/**
 * World cities pool — 100+ cities across all sub-continents.
 * tier 1 = major global hubs (spawn first), tier 2 = important, tier 3 = secondary
 */
const CITY_POOL = [
    // ── Northern Europe ──
    { name: 'Stockholm',     lat: 59.33, lon: 18.07,   region: 'northern-europe', tier: 2 },
    { name: 'Oslo',          lat: 59.91, lon: 10.75,   region: 'northern-europe', tier: 3 },
    { name: 'Helsinki',      lat: 60.17, lon: 24.94,   region: 'northern-europe', tier: 3 },
    { name: 'Copenhagen',    lat: 55.68, lon: 12.57,   region: 'northern-europe', tier: 3 },
    { name: 'Dublin',        lat: 53.35, lon: -6.26,   region: 'northern-europe', tier: 3 },
    { name: 'Reykjavik',    lat: 64.15, lon: -21.94,  region: 'northern-europe', tier: 3 },
    { name: 'Edinburgh',     lat: 55.95, lon: -3.19,   region: 'northern-europe', tier: 3 },

    // ── Western Europe ──
    { name: 'London',        lat: 51.51, lon: -0.13,   region: 'western-europe',  tier: 1 },
    { name: 'Paris',         lat: 48.86, lon: 2.35,    region: 'western-europe',  tier: 1 },
    { name: 'Berlin',        lat: 52.52, lon: 13.41,   region: 'western-europe',  tier: 1 },
    { name: 'Amsterdam',     lat: 52.37, lon: 4.90,    region: 'western-europe',  tier: 2 },
    { name: 'Brussels',      lat: 50.85, lon: 4.35,    region: 'western-europe',  tier: 3 },
    { name: 'Munich',        lat: 48.14, lon: 11.58,   region: 'western-europe',  tier: 3 },
    { name: 'Zurich',        lat: 47.38, lon: 8.54,    region: 'western-europe',  tier: 3 },
    { name: 'Vienna',        lat: 48.21, lon: 16.37,   region: 'western-europe',  tier: 2 },
    { name: 'Frankfurt',     lat: 50.11, lon: 8.68,    region: 'western-europe',  tier: 3 },
    { name: 'Hamburg',       lat: 53.55, lon: 9.99,    region: 'western-europe',  tier: 3 },

    // ── Southern Europe ──
    { name: 'Rome',          lat: 41.90, lon: 12.50,   region: 'southern-europe', tier: 1 },
    { name: 'Madrid',        lat: 40.42, lon: -3.70,   region: 'southern-europe', tier: 2 },
    { name: 'Barcelona',     lat: 41.39, lon: 2.17,    region: 'southern-europe', tier: 2 },
    { name: 'Lisbon',        lat: 38.72, lon: -9.14,   region: 'southern-europe', tier: 3 },
    { name: 'Athens',        lat: 37.98, lon: 23.73,   region: 'southern-europe', tier: 2 },
    { name: 'Milan',         lat: 45.46, lon: 9.19,    region: 'southern-europe', tier: 2 },
    { name: 'Naples',        lat: 40.85, lon: 14.27,   region: 'southern-europe', tier: 3 },
    { name: 'Porto',         lat: 41.16, lon: -8.63,   region: 'southern-europe', tier: 3 },
    { name: 'Belgrade',      lat: 44.79, lon: 20.47,   region: 'southern-europe', tier: 3 },
    { name: 'Zagreb',        lat: 45.81, lon: 15.98,   region: 'southern-europe', tier: 3 },

    // ── Eastern Europe ──
    { name: 'Moscow',        lat: 55.76, lon: 37.62,   region: 'eastern-europe',  tier: 1 },
    { name: 'Warsaw',        lat: 52.23, lon: 21.01,   region: 'eastern-europe',  tier: 2 },
    { name: 'Prague',        lat: 50.08, lon: 14.44,   region: 'eastern-europe',  tier: 2 },
    { name: 'Budapest',      lat: 47.50, lon: 19.04,   region: 'eastern-europe',  tier: 3 },
    { name: 'Bucharest',     lat: 44.43, lon: 26.10,   region: 'eastern-europe',  tier: 3 },
    { name: 'Kyiv',          lat: 50.45, lon: 30.52,   region: 'eastern-europe',  tier: 2 },
    { name: 'St Petersburg', lat: 59.93, lon: 30.32,   region: 'eastern-europe',  tier: 3 },
    { name: 'Minsk',         lat: 53.90, lon: 27.57,   region: 'eastern-europe',  tier: 3 },
    { name: 'Sofia',         lat: 42.70, lon: 23.32,   region: 'eastern-europe',  tier: 3 },

    // ── West Asia ──
    { name: 'Istanbul',      lat: 41.01, lon: 28.98,   region: 'west-asia',       tier: 1 },
    { name: 'Dubai',         lat: 25.20, lon: 55.27,   region: 'west-asia',       tier: 1 },
    { name: 'Riyadh',        lat: 24.71, lon: 46.68,   region: 'west-asia',       tier: 2 },
    { name: 'Tehran',        lat: 35.69, lon: 51.39,   region: 'west-asia',       tier: 2 },
    { name: 'Tel Aviv',      lat: 32.09, lon: 34.78,   region: 'west-asia',       tier: 3 },
    { name: 'Doha',          lat: 25.29, lon: 51.53,   region: 'west-asia',       tier: 3 },
    { name: 'Ankara',        lat: 39.93, lon: 32.86,   region: 'west-asia',       tier: 3 },
    { name: 'Baghdad',       lat: 33.31, lon: 44.37,   region: 'west-asia',       tier: 3 },
    { name: 'Muscat',        lat: 23.59, lon: 58.54,   region: 'west-asia',       tier: 3 },

    // ── Central Asia ──
    { name: 'Almaty',        lat: 43.24, lon: 76.95,   region: 'central-asia',    tier: 3 },
    { name: 'Tashkent',      lat: 41.30, lon: 69.28,   region: 'central-asia',    tier: 3 },
    { name: 'Astana',        lat: 51.17, lon: 71.43,   region: 'central-asia',    tier: 3 },

    // ── South Asia ──
    { name: 'Mumbai',        lat: 19.08, lon: 72.88,   region: 'south-asia',      tier: 1 },
    { name: 'Delhi',         lat: 28.61, lon: 77.21,   region: 'south-asia',      tier: 1 },
    { name: 'Dhaka',         lat: 23.81, lon: 90.41,   region: 'south-asia',      tier: 2 },
    { name: 'Kolkata',       lat: 22.57, lon: 88.36,   region: 'south-asia',      tier: 3 },
    { name: 'Karachi',       lat: 24.86, lon: 67.01,   region: 'south-asia',      tier: 2 },
    { name: 'Bangalore',     lat: 12.97, lon: 77.59,   region: 'south-asia',      tier: 2 },
    { name: 'Chennai',       lat: 13.08, lon: 80.27,   region: 'south-asia',      tier: 3 },
    { name: 'Lahore',        lat: 31.55, lon: 74.35,   region: 'south-asia',      tier: 3 },
    { name: 'Colombo',       lat: 6.93,  lon: 79.85,   region: 'south-asia',      tier: 3 },

    // ── East Asia ──
    { name: 'Tokyo',         lat: 35.68, lon: 139.69,  region: 'east-asia',       tier: 1 },
    { name: 'Beijing',       lat: 39.90, lon: 116.40,  region: 'east-asia',       tier: 1 },
    { name: 'Shanghai',      lat: 31.23, lon: 121.47,  region: 'east-asia',       tier: 1 },
    { name: 'Seoul',         lat: 37.57, lon: 126.98,  region: 'east-asia',       tier: 2 },
    { name: 'Hong Kong',     lat: 22.32, lon: 114.17,  region: 'east-asia',       tier: 2 },
    { name: 'Taipei',        lat: 25.03, lon: 121.57,  region: 'east-asia',       tier: 3 },
    { name: 'Osaka',         lat: 34.69, lon: 135.50,  region: 'east-asia',       tier: 3 },
    { name: 'Shenzhen',      lat: 22.54, lon: 114.06,  region: 'east-asia',       tier: 2 },
    { name: 'Guangzhou',     lat: 23.13, lon: 113.26,  region: 'east-asia',       tier: 3 },
    { name: 'Chengdu',       lat: 30.57, lon: 104.07,  region: 'east-asia',       tier: 3 },
    { name: 'Ulaanbaatar',   lat: 47.92, lon: 106.91,  region: 'east-asia',       tier: 3 },

    // ── Southeast Asia ──
    { name: 'Singapore',     lat: 1.35,  lon: 103.82,  region: 'southeast-asia',  tier: 1 },
    { name: 'Bangkok',       lat: 13.76, lon: 100.50,  region: 'southeast-asia',  tier: 1 },
    { name: 'Jakarta',       lat: -6.21, lon: 106.85,  region: 'southeast-asia',  tier: 2 },
    { name: 'Manila',        lat: 14.60, lon: 120.98,  region: 'southeast-asia',  tier: 2 },
    { name: 'Hanoi',         lat: 21.03, lon: 105.85,  region: 'southeast-asia',  tier: 3 },
    { name: 'Kuala Lumpur',  lat: 3.14,  lon: 101.69,  region: 'southeast-asia',  tier: 3 },
    { name: 'Ho Chi Minh',   lat: 10.82, lon: 106.63,  region: 'southeast-asia',  tier: 2 },
    { name: 'Phnom Penh',    lat: 11.56, lon: 104.92,  region: 'southeast-asia',  tier: 3 },
    { name: 'Yangon',        lat: 16.87, lon: 96.20,   region: 'southeast-asia',  tier: 3 },

    // ── North America ──
    { name: 'New York',      lat: 40.71, lon: -74.01,  region: 'north-america',   tier: 1 },
    { name: 'Los Angeles',   lat: 34.05, lon: -118.24, region: 'north-america',   tier: 1 },
    { name: 'Chicago',       lat: 41.88, lon: -87.63,  region: 'north-america',   tier: 2 },
    { name: 'Toronto',       lat: 43.65, lon: -79.38,  region: 'north-america',   tier: 2 },
    { name: 'San Francisco', lat: 37.77, lon: -122.42, region: 'north-america',   tier: 2 },
    { name: 'Miami',         lat: 25.76, lon: -80.19,  region: 'north-america',   tier: 3 },
    { name: 'Vancouver',     lat: 49.28, lon: -123.12, region: 'north-america',   tier: 3 },
    { name: 'Houston',       lat: 29.76, lon: -95.37,  region: 'north-america',   tier: 3 },
    { name: 'Montreal',      lat: 45.50, lon: -73.57,  region: 'north-america',   tier: 3 },
    { name: 'Atlanta',       lat: 33.75, lon: -84.39,  region: 'north-america',   tier: 3 },
    { name: 'Washington DC', lat: 38.91, lon: -77.04,  region: 'north-america',   tier: 3 },
    { name: 'Seattle',       lat: 47.61, lon: -122.33, region: 'north-america',   tier: 3 },
    { name: 'Denver',        lat: 39.74, lon: -104.99, region: 'north-america',   tier: 3 },

    // ── Central America ──
    { name: 'Mexico City',   lat: 19.43, lon: -99.13,  region: 'central-america', tier: 1 },
    { name: 'Panama City',   lat: 8.98,  lon: -79.52,  region: 'central-america', tier: 3 },
    { name: 'Guatemala City',lat: 14.63, lon: -90.51,  region: 'central-america', tier: 3 },
    { name: 'San José',      lat: 9.93,  lon: -84.08,  region: 'central-america', tier: 3 },

    // ── Caribbean ──
    { name: 'Havana',        lat: 23.11, lon: -82.37,  region: 'caribbean',       tier: 3 },
    { name: 'Kingston',      lat: 18.00, lon: -76.79,  region: 'caribbean',       tier: 3 },
    { name: 'Santo Domingo', lat: 18.47, lon: -69.90,  region: 'caribbean',       tier: 3 },

    // ── South America ──
    { name: 'São Paulo',     lat: -23.55, lon: -46.63, region: 'south-america',   tier: 1 },
    { name: 'Buenos Aires',  lat: -34.60, lon: -58.38, region: 'south-america',   tier: 1 },
    { name: 'Rio de Janeiro',lat: -22.91, lon: -43.17, region: 'south-america',   tier: 2 },
    { name: 'Lima',          lat: -12.05, lon: -77.04, region: 'south-america',   tier: 2 },
    { name: 'Bogotá',        lat: 4.71,  lon: -74.07,  region: 'south-america',   tier: 2 },
    { name: 'Santiago',      lat: -33.45, lon: -70.67, region: 'south-america',   tier: 3 },
    { name: 'Caracas',       lat: 10.48, lon: -66.90,  region: 'south-america',   tier: 3 },
    { name: 'Medellín',      lat: 6.25,  lon: -75.56,  region: 'south-america',   tier: 3 },
    { name: 'Quito',         lat: -0.18, lon: -78.47,  region: 'south-america',   tier: 3 },
    { name: 'Montevideo',    lat: -34.88, lon: -56.16, region: 'south-america',   tier: 3 },

    // ── North Africa ──
    { name: 'Cairo',         lat: 30.04, lon: 31.24,   region: 'north-africa',    tier: 1 },
    { name: 'Casablanca',    lat: 33.57, lon: -7.59,   region: 'north-africa',    tier: 3 },
    { name: 'Algiers',       lat: 36.75, lon: 3.04,    region: 'north-africa',    tier: 3 },
    { name: 'Tunis',         lat: 36.81, lon: 10.18,   region: 'north-africa',    tier: 3 },
    { name: 'Tripoli',       lat: 32.90, lon: 13.18,   region: 'north-africa',    tier: 3 },

    // ── West Africa ──
    { name: 'Lagos',         lat: 6.52,  lon: 3.38,    region: 'west-africa',     tier: 1 },
    { name: 'Accra',         lat: 5.56,  lon: -0.19,   region: 'west-africa',     tier: 3 },
    { name: 'Dakar',         lat: 14.72, lon: -17.47,  region: 'west-africa',     tier: 3 },
    { name: 'Abuja',         lat: 9.06,  lon: 7.49,    region: 'west-africa',     tier: 3 },
    { name: 'Abidjan',       lat: 5.36,  lon: -4.01,   region: 'west-africa',     tier: 3 },

    // ── East Africa ──
    { name: 'Nairobi',       lat: -1.29, lon: 36.82,   region: 'east-africa',     tier: 2 },
    { name: 'Addis Ababa',   lat: 9.02,  lon: 38.75,   region: 'east-africa',     tier: 2 },
    { name: 'Dar es Salaam', lat: -6.79, lon: 39.28,   region: 'east-africa',     tier: 3 },
    { name: 'Khartoum',      lat: 15.50, lon: 32.56,   region: 'east-africa',     tier: 3 },
    { name: 'Kampala',       lat: 0.35,  lon: 32.58,   region: 'east-africa',     tier: 3 },

    // ── Central Africa ──
    { name: 'Kinshasa',      lat: -4.44, lon: 15.27,   region: 'central-africa',  tier: 2 },
    { name: 'Douala',        lat: 4.05,  lon: 9.77,    region: 'central-africa',  tier: 3 },
    { name: 'Luanda',        lat: -8.84, lon: 13.23,   region: 'central-africa',  tier: 3 },

    // ── Southern Africa ──
    { name: 'Johannesburg',  lat: -26.20, lon: 28.05,  region: 'southern-africa', tier: 2 },
    { name: 'Cape Town',     lat: -33.93, lon: 18.42,  region: 'southern-africa', tier: 2 },
    { name: 'Maputo',        lat: -25.97, lon: 32.57,  region: 'southern-africa', tier: 3 },
    { name: 'Harare',        lat: -17.83, lon: 31.05,  region: 'southern-africa', tier: 3 },

    // ── Oceania ──
    { name: 'Sydney',        lat: -33.87, lon: 151.21, region: 'oceania',         tier: 1 },
    { name: 'Melbourne',     lat: -37.81, lon: 144.96, region: 'oceania',         tier: 2 },
    { name: 'Auckland',      lat: -36.85, lon: 174.76, region: 'oceania',         tier: 3 },
    { name: 'Brisbane',      lat: -27.47, lon: 153.03, region: 'oceania',         tier: 3 },
    { name: 'Perth',         lat: -31.95, lon: 115.86, region: 'oceania',         tier: 3 },
    { name: 'Wellington',    lat: -41.29, lon: 174.78, region: 'oceania',         tier: 3 },
];

// Shape drawing functions — return THREE.Shape
const SHAPE_BUILDERS = {
    circle(size) {
        const shape = new THREE.Shape();
        for (let i = 0; i <= 20; i++) {
            const a = (i / 20) * Math.PI * 2;
            i === 0 ? shape.moveTo(Math.cos(a) * size, Math.sin(a) * size) : shape.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        }
        return shape;
    },
    square(size) {
        const s = size * 0.85;
        const shape = new THREE.Shape();
        shape.moveTo(-s, -s); shape.lineTo(s, -s); shape.lineTo(s, s); shape.lineTo(-s, s); shape.lineTo(-s, -s);
        return shape;
    },
    diamond(size) {
        const s = size * 1.1;
        const shape = new THREE.Shape();
        shape.moveTo(0, s); shape.lineTo(s, 0); shape.lineTo(0, -s); shape.lineTo(-s, 0); shape.lineTo(0, s);
        return shape;
    },
    triangle(size) {
        const s = size * 1.1;
        const shape = new THREE.Shape();
        shape.moveTo(0, s); shape.lineTo(s, -s * 0.6); shape.lineTo(-s, -s * 0.6); shape.lineTo(0, s);
        return shape;
    },
    hexagon(size) {
        const shape = new THREE.Shape();
        for (let i = 0; i <= 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
            i === 0 ? shape.moveTo(Math.cos(a) * size, Math.sin(a) * size) : shape.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        }
        return shape;
    },
    star(size) {
        const shape = new THREE.Shape();
        for (let i = 0; i <= 10; i++) {
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
            const r = i % 2 === 0 ? size : size * 0.45;
            i === 0 ? shape.moveTo(Math.cos(a) * r, Math.sin(a) * r) : shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        return shape;
    },
    pentagon(size) {
        const shape = new THREE.Shape();
        for (let i = 0; i <= 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            i === 0 ? shape.moveTo(Math.cos(a) * size, Math.sin(a) * size) : shape.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        }
        return shape;
    },
    cross(size) {
        const s = size, t = size * 0.35;
        const shape = new THREE.Shape();
        shape.moveTo(-t, s); shape.lineTo(t, s); shape.lineTo(t, t);
        shape.lineTo(s, t); shape.lineTo(s, -t); shape.lineTo(t, -t);
        shape.lineTo(t, -s); shape.lineTo(-t, -s); shape.lineTo(-t, -t);
        shape.lineTo(-s, -t); shape.lineTo(-s, t); shape.lineTo(-t, t);
        shape.lineTo(-t, s);
        return shape;
    },
    octagon(size) {
        const shape = new THREE.Shape();
        for (let i = 0; i <= 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            i === 0 ? shape.moveTo(Math.cos(a) * size, Math.sin(a) * size) : shape.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        }
        return shape;
    }
};
