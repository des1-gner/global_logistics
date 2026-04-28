/**
 * HUD — score, multi-resource display, speed controls.
 */
const HUD = (function () {
    const els = {};

    function init() {
        els.score = document.getElementById('score-val');
        els.delivered = document.getElementById('delivered-val');
        els.cities = document.getElementById('cities-val');
        els.week = document.getElementById('week-val');
        els.money = document.getElementById('money-val');
        els.steel = document.getElementById('steel-val');
        els.fuel = document.getElementById('fuel-val');
        els.maintenance = document.getElementById('maintenance-val');

        // Speed buttons
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const st = GameState.get();
                st.gameSpeed = btn.dataset.speed;
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    function update() {
        const st = GameState.get();
        els.score.textContent = st.score;
        els.delivered.textContent = st.delivered;
        els.cities.textContent = st.activeCities.length;
        els.week.textContent = st.week;
        els.money.textContent = '$' + st.resources.money;
        els.steel.textContent = st.resources.steel;
        els.fuel.textContent = st.resources.fuel;

        // Calculate total maintenance
        let mMoney = 0, mSteel = 0, mFuel = 0;
        st.connections.forEach(c => {
            const m = GameState.MAINTENANCE[c.type];
            mMoney += m.money; mSteel += m.steel; mFuel += m.fuel;
        });
        els.maintenance.textContent = '-$' + mMoney + ' -\uD83D\uDD29' + mSteel + ' -\u26FD' + mFuel + '/wk';

        // Color resources red if low
        els.money.style.color = st.resources.money < 50 ? '#f87171' : '#4ade80';
        els.steel.style.color = st.resources.steel < 10 ? '#f87171' : '#94a3b8';
        els.fuel.style.color = st.resources.fuel < 10 ? '#f87171' : '#94a3b8';
    }

    return { init, update };
})();