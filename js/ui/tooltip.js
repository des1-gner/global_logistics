/**
 * Tooltip for hovering over cities — shows name, region, passengers.
 */
const Tooltip = (function () {
    let el, nameEl, infoEl, passEl;

    function init() {
        el = document.getElementById('tooltip');
        nameEl = el.querySelector('.tooltip-name');
        infoEl = el.querySelector('.tooltip-info');
        passEl = el.querySelector('.tooltip-passengers');
    }

    function show(city, x, y) {
        const region = REGIONS[city.data.region];
        nameEl.textContent = city.data.name;
        infoEl.textContent = region ? region.name : city.data.region;

        // Passenger dots
        passEl.innerHTML = '';
        city.passengers.forEach(p => {
            const dot = document.createElement('div');
            dot.className = 'pdot';
            dot.style.background = p.color;
            dot.title = REGIONS[p.destRegion]?.name || p.destRegion;
            passEl.appendChild(dot);
        });

        if (city.passengers.length === 0) {
            passEl.innerHTML = '<span style="color:rgba(255,255,255,0.25);font-size:0.65rem;">No passengers</span>';
        }

        el.style.display = 'block';
        el.style.left = (x + 14) + 'px';
        el.style.top = (y - 10) + 'px';

        // Keep on screen
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth) el.style.left = (x - rect.width - 10) + 'px';
        if (rect.bottom > window.innerHeight) el.style.top = (y - rect.height - 10) + 'px';
    }

    function hide() {
        el.style.display = 'none';
    }

    return { init, show, hide };
})();
