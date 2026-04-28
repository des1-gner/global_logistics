/**
 * Tooltip — city name, region, population, infrastructure (color-coded),
 * cost multiplier, and passengers.
 */
const Tooltip = (function () {
    let el, nameEl, infoEl, infraEl, costEl, passEl;

    const INFRA_COLORS = {
        1: '#8b3a3a',
        2: '#9a7a3a',
        3: '#7a8a4a',
        4: '#4a8a6a',
        5: '#3a9a9a',
    };

    const INFRA_LABELS = {
        1: 'Poor',
        2: 'Developing',
        3: 'Moderate',
        4: 'Good',
        5: 'Excellent',
    };

    function init() {
        el = document.getElementById('tooltip');
        nameEl = el.querySelector('.tooltip-name');
        infoEl = el.querySelector('.tooltip-info');
        infraEl = el.querySelector('.tooltip-infra');
        costEl = el.querySelector('.tooltip-cost');
        passEl = el.querySelector('.tooltip-passengers');
    }

    function show(city, x, y) {
        const region = REGIONS[city.data.region];
        nameEl.textContent = city.data.name;
        infoEl.textContent = (region ? region.name : city.data.region) + ' \u00B7 Pop: ' + city.data.pop + 'M';

        const infra = city.data.infra || 1;
        const color = INFRA_COLORS[infra] || INFRA_COLORS[3];
        const label = INFRA_LABELS[infra] || 'Unknown';
        const bars = '\u2588'.repeat(infra) + '\u2591'.repeat(5 - infra);
        infraEl.innerHTML = 'Infrastructure: <span style="color:' + color + ';font-weight:600;">' + bars + ' ' + label + '</span>';

        // Cost multiplier display — infra only (distance depends on target city)
        const mult = 2.1 - (infra * 0.28);
        costEl.innerHTML = 'Infra cost: <span style="color:' + color + ';font-weight:600;">' + mult.toFixed(1) + 'x</span> <span style="color:rgba(255,255,255,0.3)">· distance adds more</span>';

        passEl.innerHTML = '';
        if (city.passengers.length === 0) {
            passEl.innerHTML = '<span style="color:rgba(255,255,255,0.2);font-size:0.6rem;">No passengers</span>';
        } else {
            city.passengers.forEach(p => {
                const dot = document.createElement('div');
                dot.className = 'pdot';
                dot.style.background = p.color;
                dot.title = REGIONS[p.destRegion]?.name || p.destRegion;
                passEl.appendChild(dot);
            });
        }

        el.style.display = 'block';
        el.style.left = (x + 14) + 'px';
        el.style.top = (y - 10) + 'px';
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth) el.style.left = (x - rect.width - 10) + 'px';
        if (rect.bottom > window.innerHeight) el.style.top = (y - rect.height - 10) + 'px';
    }

    function hide() { if (el) el.style.display = 'none'; }

    return { init, show, hide };
})();