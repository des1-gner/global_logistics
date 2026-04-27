/**
 * HUD updates — score, money, delivery count, week.
 */
const HUD = (function () {
    const els = {};

    function init() {
        els.score = document.getElementById('score-val');
        els.delivered = document.getElementById('delivered-val');
        els.cities = document.getElementById('cities-val');
        els.week = document.getElementById('week-val');
        els.money = document.getElementById('money-val');
    }

    function update() {
        const st = GameState.get();
        els.score.textContent = st.score;
        els.delivered.textContent = st.delivered;
        els.cities.textContent = st.activeCities.length;
        els.week.textContent = st.week;
        els.money.textContent = '$' + st.money;

        // Update transport button affordability
        document.querySelectorAll('.transport-btn[data-type]').forEach(btn => {
            const type = btn.dataset.type;
            const cost = GameState.TRANSPORT_COSTS[type];
            if (cost !== undefined) {
                const canAfford = st.money >= cost;
                btn.style.opacity = canAfford ? '1' : '0.4';
            }
        });
    }

    return { init, update };
})();
