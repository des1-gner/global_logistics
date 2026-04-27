/**
 * Sub-continent regions with distinct colors for passenger destination coding.
 * Each region has a color, a display name, and a shape type for city markers.
 */
const REGIONS = {
    // Europe
    'northern-europe':  { name: 'Northern Europe',    color: '#4dc9f6', shape: 'circle',   continent: 'europe' },
    'western-europe':   { name: 'Western Europe',     color: '#3b82f6', shape: 'square',   continent: 'europe' },
    'eastern-europe':   { name: 'Eastern Europe',     color: '#8b5cf6', shape: 'diamond',  continent: 'europe' },
    'southern-europe':  { name: 'Southern Europe',    color: '#6366f1', shape: 'triangle', continent: 'europe' },

    // Asia
    'east-asia':        { name: 'East Asia',          color: '#f43f5e', shape: 'hexagon',  continent: 'asia' },
    'southeast-asia':   { name: 'Southeast Asia',     color: '#fb923c', shape: 'star',     continent: 'asia' },
    'south-asia':       { name: 'South Asia',         color: '#f97316', shape: 'pentagon', continent: 'asia' },
    'central-asia':     { name: 'Central Asia',       color: '#e11d48', shape: 'cross',    continent: 'asia' },
    'west-asia':        { name: 'West Asia',          color: '#be123c', shape: 'octagon',  continent: 'asia' },

    // Americas
    'north-america':    { name: 'North America',      color: '#22c55e', shape: 'circle',   continent: 'americas' },
    'central-america':  { name: 'Central America',    color: '#16a34a', shape: 'diamond',  continent: 'americas' },
    'south-america':    { name: 'South America',      color: '#4ade80', shape: 'triangle', continent: 'americas' },
    'caribbean':        { name: 'Caribbean',          color: '#86efac', shape: 'star',     continent: 'americas' },

    // Africa
    'north-africa':     { name: 'North Africa',       color: '#eab308', shape: 'square',   continent: 'africa' },
    'west-africa':      { name: 'West Africa',        color: '#facc15', shape: 'hexagon',  continent: 'africa' },
    'east-africa':      { name: 'East Africa',        color: '#fde047', shape: 'pentagon', continent: 'africa' },
    'southern-africa':  { name: 'Southern Africa',    color: '#ca8a04', shape: 'cross',    continent: 'africa' },
    'central-africa':   { name: 'Central Africa',     color: '#a16207', shape: 'octagon',  continent: 'africa' },

    // Oceania
    'oceania':          { name: 'Oceania',            color: '#ec4899', shape: 'diamond',  continent: 'oceania' },
};
