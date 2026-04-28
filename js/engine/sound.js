/**
 * Sound system — procedural Web Audio API sounds, no external files.
 * Hearts of Iron / grand strategy vibe: mechanical clicks, chimes, horns.
 */
const Sound = (function () {
    let ctx = null;
    let masterGain = null;
    let enabled = true;

    function init() {
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = ctx.createGain();
            masterGain.gain.value = 0.3;
            masterGain.connect(ctx.destination);
        } catch (e) {
            console.warn('Web Audio not available');
            enabled = false;
        }
    }

    function resume() {
        if (ctx && ctx.state === 'suspended') ctx.resume();
    }

    function playTone(freq, duration, type, volume, delay) {
        if (!enabled || !ctx) return;
        resume();
        const t = ctx.currentTime + (delay || 0);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume || 0.15, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + duration);
    }

    function playNoise(duration, volume, delay) {
        if (!enabled || !ctx) return;
        resume();
        const t = ctx.currentTime + (delay || 0);
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume || 0.05, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        source.start(t);
        source.stop(t + duration);
    }

    // ── Game sounds ──

    /** Click on a city / UI element */
    function click() {
        playTone(800, 0.08, 'square', 0.08);
        playTone(1200, 0.06, 'square', 0.04, 0.02);
    }

    /** Start drawing a route */
    function drawStart() {
        playTone(440, 0.15, 'sine', 0.12);
        playTone(660, 0.12, 'sine', 0.08, 0.08);
    }

    /** Place a waypoint */
    function waypoint() {
        playTone(600, 0.06, 'triangle', 0.1);
    }

    /** Route completed / connection built */
    function buildComplete() {
        playTone(523, 0.15, 'sine', 0.12);
        playTone(659, 0.12, 'sine', 0.10, 0.1);
        playTone(784, 0.2, 'sine', 0.08, 0.2);
    }

    /** Train horn — low brass sound */
    function trainHorn() {
        playTone(220, 0.3, 'sawtooth', 0.06);
        playTone(277, 0.25, 'sawtooth', 0.04, 0.05);
    }

    /** Boat horn — deep foghorn */
    function boatHorn() {
        playTone(110, 0.5, 'sawtooth', 0.08);
        playTone(165, 0.4, 'sawtooth', 0.04, 0.1);
    }

    /** Plane takeoff whoosh */
    function planeWhoosh() {
        playNoise(0.4, 0.06);
        playTone(300, 0.3, 'sine', 0.05);
        playTone(500, 0.2, 'sine', 0.03, 0.15);
    }

    /** Passenger delivered — cheerful chime */
    function deliver() {
        playTone(784, 0.1, 'sine', 0.1);
        playTone(988, 0.1, 'sine', 0.08, 0.08);
        playTone(1175, 0.15, 'sine', 0.06, 0.16);
    }

    /** New city spawned — map ping */
    function citySpawn() {
        playTone(1047, 0.08, 'sine', 0.1);
        playTone(880, 0.12, 'sine', 0.06, 0.06);
    }

    /** Delete / remove connection */
    function remove() {
        playTone(400, 0.1, 'square', 0.08);
        playTone(300, 0.15, 'square', 0.06, 0.05);
    }

    /** Error / can't afford */
    function error() {
        playTone(200, 0.15, 'square', 0.1);
        playTone(150, 0.2, 'square', 0.08, 0.1);
    }

    /** New week tick */
    function weekTick() {
        playTone(660, 0.05, 'triangle', 0.06);
    }

    /** Game over */
    function gameOver() {
        playTone(440, 0.3, 'sawtooth', 0.1);
        playTone(370, 0.3, 'sawtooth', 0.08, 0.2);
        playTone(311, 0.5, 'sawtooth', 0.06, 0.4);
    }

    /** Game start — fanfare */
    function gameStart() {
        playTone(523, 0.15, 'sine', 0.12);
        playTone(659, 0.15, 'sine', 0.10, 0.12);
        playTone(784, 0.15, 'sine', 0.10, 0.24);
        playTone(1047, 0.3, 'sine', 0.12, 0.36);
    }

    /** Cancel drawing */
    function cancel() {
        playTone(500, 0.08, 'square', 0.06);
        playTone(400, 0.1, 'square', 0.05, 0.04);
    }

    function setVolume(v) {
        if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
    }

    function toggle() {
        enabled = !enabled;
        return enabled;
    }

    return {
        init, click, drawStart, waypoint, buildComplete,
        trainHorn, boatHorn, planeWhoosh,
        deliver, citySpawn, remove, error,
        weekTick, gameOver, gameStart, cancel,
        setVolume, toggle, resume,
    };
})();
