/**
 * Renderer utilities — simplified for globe.gl.
 * Globe.gl handles most picking natively via onObjectClick/onGlobeClick.
 * This module provides screen-position utilities for tooltips.
 */
const Picker = (function () {

    /**
     * Convert a lat/lng to screen coordinates using globe.gl's internal projection.
     */
    function screenPosition(lat, lng) {
        const globe = GlobeEngine.getGlobe();
        if (!globe) return { x: 0, y: 0 };
        // Use globe.gl's getScreenCoords method if available
        const coords = globe.getScreenCoords(lat, lng, 0.015);
        if (coords) return { x: coords.x, y: coords.y };
        return { x: 0, y: 0 };
    }

    return { screenPosition };
})();