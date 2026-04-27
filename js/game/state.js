/**
 * Core game state — economy, cities, connections, passengers.
 * No connection limits. Any two cities can be connected multiple times.
 */
const GameState = (function () {
    const MAX_PASSENGERS_PER_CITY = 6;

    const TRANSPORT_TYPES = {
        train: { speed: 0.35, label: 'Train', emoji: '🚂' },
        plane: { speed: 0.7,  label: 'Plane', emoji: '✈️' },
        boat:  { speed: 0.18, label: 'Boat',  emoji: '🚢' },
    };

    const TRANSPORT_COSTS = {
        train: 50,
        plane: 150,
        boat:  80,
    };

    const DELIVERY_REWARD = 30;
    const CROSS_CONTINENT_BONUS = 20;

    let state = null;

    function createInitialState() {
        return {
            running: false,
            gameOver: false,
            score: 0,
            delivered: 0,
            money: 500,
            week: 1,
            elapsed: 0,
            lastSpawnTime: 0,
            lastPassengerTime: 0,
            spawnInterval: 8,
            passengerInterval: 4,
            selectedTool: 'train',
            pendingConnection: null,
            activeCities: [],
            connections: [],
            travelers: [],
            nextCityId: 0,
            nextConnectionId: 0,
            spawnQueue: [],
            citySpawnIndex: 0,
        };
    }

    function reset() {
        state = createInitialState();
        const byTier = { 1: [], 2: [], 3: [] };
        CITY_POOL.forEach(c => {
            const t = c.tier || 3;
            if (!byTier[t]) byTier[t] = [];
            byTier[t].push(c);
        });
        Object.values(byTier).forEach(arr => shuffleArray(arr));
        state.spawnQueue = [...byTier[1], ...byTier[2], ...byTier[3]];
    }

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    function get() { return state; }

    function addCity(cityData) {
        const id = state.nextCityId++;
        const city = {
            id, data: cityData, passengers: [],
            mesh: null, labelSprite: null, ring: null,
            passengerDots: [], pulsePhase: Math.random() * Math.PI * 2,
        };
        state.activeCities.push(city);
        return city;
    }

    function addConnection(fromCity, toCity, type) {
        const id = state.nextConnectionId++;
        const conn = { id, from: fromCity, to: toCity, type, mesh: null };
        state.connections.push(conn);
        state.money -= TRANSPORT_COSTS[type];
        return conn;
    }

    function removeConnection(connId) {
        const idx = state.connections.findIndex(c => c.id === connId);
        if (idx === -1) return null;
        const conn = state.connections[idx];
        state.money += Math.floor(TRANSPORT_COSTS[conn.type] / 2);
        state.connections.splice(idx, 1);
        return conn;
    }

    function findConnection(cityA, cityB) {
        return state.connections.find(c =>
            (c.from.id === cityA.id && c.to.id === cityB.id) ||
            (c.from.id === cityB.id && c.to.id === cityA.id)
        );
    }

    function findConnectionsForCity(city) {
        return state.connections.filter(c => c.from.id === city.id || c.to.id === city.id);
    }

    function deliverPassenger(fromRegion, toRegion) {
        state.score += 10;
        state.delivered++;
        state.money += DELIVERY_REWARD;
        const fromC = REGIONS[fromRegion]?.continent;
        const toC = REGIONS[toRegion]?.continent;
        if (fromC !== toC) {
            state.money += CROSS_CONTINENT_BONUS;
            state.score += 5;
        }
    }

    return {
        reset, get, addCity, addConnection, removeConnection,
        findConnection, findConnectionsForCity, deliverPassenger,
        TRANSPORT_TYPES, TRANSPORT_COSTS, MAX_PASSENGERS_PER_CITY,
        DELIVERY_REWARD, CROSS_CONTINENT_BONUS,
    };
})();
