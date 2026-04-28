/**
 * Core game state — multi-resource economy with maintenance costs.
 * Resources: Money, Steel (for trains/boats), Fuel (for planes/boats).
 * Infrastructure rating affects build cost multiplier.
 * Each connection has a per-tick maintenance cost.
 *
 * Updated economy: higher starting resources, more lenient game-over thresholds.
 */
const GameState = (function () {
    const MAX_PASSENGERS_PER_CITY = 6;

    const TRANSPORT_TYPES = {
        train: { speed: 0.30, label: 'Train', emoji: '\uD83D\uDE82' },
        plane: { speed: 0.65, label: 'Plane', emoji: '\u2708\uFE0F' },
        boat:  { speed: 0.15, label: 'Boat',  emoji: '\uD83D\uDEA2' },
    };

    // Base build costs: { money, steel, fuel }
    const BUILD_COSTS = {
        train: { money: 35, steel: 20, fuel: 0 },
        plane: { money: 150, steel: 2, fuel: 15 },
        boat:  { money: 50, steel: 12, fuel: 12 },
    };

    // Maintenance per connection per week: { money, steel, fuel }
    const MAINTENANCE = {
        train: { money: 3, steel: 1, fuel: 0 },
        plane: { money: 8, steel: 0, fuel: 4 },
        boat:  { money: 4, steel: 1, fuel: 2 },
    };

    // Delivery rewards
    const DELIVERY_REWARD = { money: 40, steel: 4, fuel: 4 };
    const CROSS_CONTINENT_BONUS = { money: 30, steel: 6, fuel: 6 };

    // Weekly passive income
    const WEEKLY_INCOME = { money: 40, steel: 10, fuel: 10 };

    // Game speed multipliers
    const SPEED_MULT = { slow: 0.5, normal: 1.0, fast: 2.0 };

    let state = null;

    function createInitialState() {
        return {
            running: false,
            gameOver: false,
            score: 0,
            delivered: 0,
            resources: { money: 1800, steel: 150, fuel: 120 },
            week: 1,
            elapsed: 0,
            lastSpawnTime: 0,
            lastPassengerTime: 0,
            lastMaintenanceTime: 0,
            spawnInterval: 8,
            passengerInterval: 4,
            selectedTool: 'train',
            pendingConnection: null,
            activeCities: [],
            connections: [],
            travelers: [],
            vehicles: [],
            nextCityId: 0,
            nextConnectionId: 0,
            spawnQueue: [],
            citySpawnIndex: 0,
            gameSpeed: 'normal',
        };
    }

    function reset() {
        state = createInitialState();
        const byTier = { 1: [], 2: [], 3: [], 4: [] };
        CITY_POOL.forEach(c => {
            const t = c.tier || 4;
            if (!byTier[t]) byTier[t] = [];
            byTier[t].push(c);
        });
        Object.values(byTier).forEach(arr => shuffleArray(arr));
        state.spawnQueue = [...byTier[1], ...byTier[2], ...byTier[3], ...byTier[4]];
    }

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    function get() { return state; }
    function getSpeedMult() { return SPEED_MULT[state.gameSpeed] || 1.0; }

    /**
     * Get the infrastructure cost multiplier for a connection between two cities.
     * Lower infra = higher cost. Average of both cities' infra ratings.
     * infra 5 = 0.7x, infra 1 = 1.8x
     */
    function infraMultiplier(cityA, cityB) {
        const avgInfra = ((cityA.data.infra || 3) + (cityB.data.infra || 3)) / 2;
        return 2.1 - (avgInfra * 0.28);
    }

    /**
     * Great-circle distance between two cities in degrees (approximate).
     */
    function cityDistance(cityA, cityB) {
        var dLat = cityB.data.lat - cityA.data.lat;
        var dLng = cityB.data.lng - cityA.data.lng;
        if (dLng > 180) dLng -= 360;
        if (dLng < -180) dLng += 360;
        return Math.sqrt(dLat * dLat + dLng * dLng);
    }

    /**
     * Distance multiplier: short routes (~10°) = 1x, long routes (~180°) = ~4x.
     * Scales linearly so cost grows with distance but isn't punishing for nearby cities.
     */
    function distanceMultiplier(cityA, cityB) {
        var dist = cityDistance(cityA, cityB);
        return Math.max(1, 0.5 + dist / 30);
    }

    function getBuildCost(type, cityA, cityB) {
        const base = BUILD_COSTS[type];
        const infraMult = infraMultiplier(cityA, cityB);
        const distMult = distanceMultiplier(cityA, cityB);
        const totalMult = infraMult * distMult;
        return {
            money: Math.ceil(base.money * totalMult),
            steel: Math.ceil(base.steel * totalMult),
            fuel: Math.ceil(base.fuel * totalMult),
        };
    }

    function canAfford(cost) {
        return state.resources.money >= cost.money &&
               state.resources.steel >= cost.steel &&
               state.resources.fuel >= cost.fuel;
    }

    function spendResources(cost) {
        state.resources.money -= cost.money;
        state.resources.steel -= cost.steel;
        state.resources.fuel -= cost.fuel;
    }

    function addResources(r) {
        state.resources.money += r.money || 0;
        state.resources.steel += r.steel || 0;
        state.resources.fuel += r.fuel || 0;
    }

    function addCity(cityData) {
        const id = state.nextCityId++;
        const city = {
            id, data: cityData, passengers: [],
            passengerDots: [], pulsePhase: Math.random() * Math.PI * 2,
            highlighted: false,
        };
        state.activeCities.push(city);
        return city;
    }

    function addConnection(fromCity, toCity, type) {
        const id = state.nextConnectionId++;
        const cost = getBuildCost(type, fromCity, toCity);
        spendResources(cost);
        const conn = { id, from: fromCity, to: toCity, type, buildCost: cost, waypoints: null };
        state.connections.push(conn);
        return conn;
    }

    function removeConnection(connId) {
        const idx = state.connections.findIndex(c => c.id === connId);
        if (idx === -1) return null;
        const conn = state.connections[idx];
        // Refund 40%
        addResources({
            money: Math.floor((conn.buildCost?.money || 0) * 0.4),
            steel: Math.floor((conn.buildCost?.steel || 0) * 0.4),
            fuel: Math.floor((conn.buildCost?.fuel || 0) * 0.4),
        });
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
        addResources(DELIVERY_REWARD);
        const fromC = REGIONS[fromRegion]?.continent;
        const toC = REGIONS[toRegion]?.continent;
        if (fromC !== toC) {
            addResources(CROSS_CONTINENT_BONUS);
            state.score += 5;
        }
    }

    /** Deduct maintenance for all connections. Never causes game over. */
    function deductMaintenance() {
        let totalMoney = 0, totalSteel = 0, totalFuel = 0;
        state.connections.forEach(conn => {
            const m = MAINTENANCE[conn.type];
            totalMoney += m.money;
            totalSteel += m.steel;
            totalFuel += m.fuel;
        });
        state.resources.money -= totalMoney;
        state.resources.steel -= totalSteel;
        state.resources.fuel -= totalFuel;
        return true; // never game over from resources
    }

    function applyWeeklyIncome() {
        addResources(WEEKLY_INCOME);
    }

    return {
        reset, get, getSpeedMult, addCity, addConnection, removeConnection,
        findConnection, findConnectionsForCity, deliverPassenger,
        deductMaintenance, applyWeeklyIncome, canAfford, getBuildCost,
        infraMultiplier,
        TRANSPORT_TYPES, BUILD_COSTS, MAINTENANCE, MAX_PASSENGERS_PER_CITY,
        DELIVERY_REWARD, CROSS_CONTINENT_BONUS, WEEKLY_INCOME,
    };
})();