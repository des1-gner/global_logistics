/**
 * World cities with population >1M. Includes infrastructure rating (1-5, higher=easier to build).
 * pop = population in millions, infra = infrastructure quality rating.
 * tier: 1=megacity(>10M), 2=major(>5M), 3=large(>2M), 4=medium(>1M)
 * Uses lng (not lon) for globe.gl compatibility.
 */
const CITY_POOL = [
// ── East Asia ──
{name:'Tokyo',lat:35.68,lng:139.69,region:'east-asia',pop:37.4,infra:5,tier:1},
{name:'Shanghai',lat:31.23,lng:121.47,region:'east-asia',pop:28.5,infra:4,tier:1},
{name:'Beijing',lat:39.90,lng:116.40,region:'east-asia',pop:21.5,infra:4,tier:1},
{name:'Guangzhou',lat:23.13,lng:113.26,region:'east-asia',pop:16.1,infra:4,tier:1},
{name:'Seoul',lat:37.57,lng:126.98,region:'east-asia',pop:9.9,infra:5,tier:2},
{name:'Chengdu',lat:30.57,lng:104.07,region:'east-asia',pop:9.4,infra:3,tier:2},
{name:'Hong Kong',lat:22.32,lng:114.17,region:'east-asia',pop:7.6,infra:5,tier:2},
{name:'Osaka',lat:34.69,lng:135.50,region:'east-asia',pop:5.3,infra:5,tier:2},
{name:'Taipei',lat:25.03,lng:121.57,region:'east-asia',pop:4.4,infra:5,tier:3},
{name:'Busan',lat:35.18,lng:129.08,region:'east-asia',pop:3.4,infra:5,tier:3},
{name:'Harbin',lat:45.75,lng:126.65,region:'east-asia',pop:2.9,infra:2,tier:3},
{name:'Ulaanbaatar',lat:47.92,lng:106.91,region:'east-asia',pop:1.5,infra:1,tier:4},
{name:'Pyongyang',lat:39.02,lng:125.75,region:'east-asia',pop:3.0,infra:1,tier:3},
{name:'Nagoya',lat:35.18,lng:136.91,region:'east-asia',pop:2.3,infra:5,tier:3},

// ── Southeast Asia ──
{name:'Jakarta',lat:-6.21,lng:106.85,region:'southeast-asia',pop:11.2,infra:2,tier:1},
{name:'Manila',lat:14.60,lng:120.98,region:'southeast-asia',pop:14.4,infra:2,tier:1},
{name:'Bangkok',lat:13.76,lng:100.50,region:'southeast-asia',pop:11.1,infra:3,tier:1},
{name:'Ho Chi Minh',lat:10.82,lng:106.63,region:'southeast-asia',pop:9.3,infra:2,tier:2},
{name:'Singapore',lat:1.35,lng:103.82,region:'southeast-asia',pop:6.0,infra:5,tier:2},
{name:'Kuala Lumpur',lat:3.14,lng:101.69,region:'southeast-asia',pop:8.3,infra:4,tier:2},
{name:'Hanoi',lat:21.03,lng:105.85,region:'southeast-asia',pop:5.1,infra:2,tier:2},
{name:'Yangon',lat:16.87,lng:96.20,region:'southeast-asia',pop:5.6,infra:1,tier:2},
{name:'Phnom Penh',lat:11.56,lng:104.92,region:'southeast-asia',pop:2.3,infra:1,tier:3},


// ── South Asia ──
{name:'Delhi',lat:28.61,lng:77.21,region:'south-asia',pop:32.9,infra:3,tier:1},
{name:'Mumbai',lat:19.08,lng:72.88,region:'south-asia',pop:21.7,infra:3,tier:1},
{name:'Dhaka',lat:23.81,lng:90.41,region:'south-asia',pop:23.2,infra:1,tier:1},
{name:'Kolkata',lat:22.57,lng:88.36,region:'south-asia',pop:15.3,infra:2,tier:1},
{name:'Bangalore',lat:12.97,lng:77.59,region:'south-asia',pop:13.7,infra:3,tier:1},
{name:'Karachi',lat:24.86,lng:67.01,region:'south-asia',pop:16.8,infra:2,tier:1},
{name:'Chennai',lat:13.08,lng:80.27,region:'south-asia',pop:11.3,infra:3,tier:1},
{name:'Lahore',lat:31.55,lng:74.35,region:'south-asia',pop:13.5,infra:2,tier:1},
{name:'Colombo',lat:6.93,lng:79.85,region:'south-asia',pop:2.4,infra:2,tier:3},
{name:'Kathmandu',lat:27.72,lng:85.32,region:'south-asia',pop:1.5,infra:1,tier:4},
{name:'Islamabad',lat:33.69,lng:73.04,region:'south-asia',pop:1.2,infra:2,tier:4},

// ── West Asia / Middle East ──
{name:'Istanbul',lat:41.01,lng:28.98,region:'west-asia',pop:15.9,infra:3,tier:1},
{name:'Tehran',lat:35.69,lng:51.39,region:'west-asia',pop:9.4,infra:2,tier:2},
{name:'Baghdad',lat:33.31,lng:44.37,region:'west-asia',pop:7.5,infra:1,tier:2},
{name:'Riyadh',lat:24.71,lng:46.68,region:'west-asia',pop:7.7,infra:4,tier:2},
{name:'Dubai',lat:25.20,lng:55.27,region:'west-asia',pop:3.6,infra:5,tier:3},
{name:'Ankara',lat:39.93,lng:32.86,region:'west-asia',pop:5.7,infra:3,tier:2},
{name:'Jeddah',lat:21.49,lng:39.19,region:'west-asia',pop:4.7,infra:4,tier:3},
{name:'Tel Aviv',lat:32.09,lng:34.78,region:'west-asia',pop:4.3,infra:5,tier:3},
{name:'Doha',lat:25.29,lng:51.53,region:'west-asia',pop:2.4,infra:5,tier:3},
{name:'Kuwait City',lat:29.38,lng:47.99,region:'west-asia',pop:3.1,infra:4,tier:3},
{name:'Muscat',lat:23.59,lng:58.54,region:'west-asia',pop:1.5,infra:3,tier:4},
{name:'Amman',lat:31.95,lng:35.93,region:'west-asia',pop:2.2,infra:3,tier:3},
{name:'Beirut',lat:33.89,lng:35.50,region:'west-asia',pop:2.4,infra:2,tier:3},
{name:'Abu Dhabi',lat:24.45,lng:54.65,region:'west-asia',pop:1.5,infra:5,tier:4},
{name:'Izmir',lat:38.42,lng:27.14,region:'west-asia',pop:3.1,infra:3,tier:3},
{name:'Baku',lat:40.41,lng:49.87,region:'west-asia',pop:2.3,infra:2,tier:3},
{name:'Tbilisi',lat:41.72,lng:44.79,region:'west-asia',pop:1.2,infra:2,tier:4},
{name:'Yerevan',lat:40.18,lng:44.51,region:'west-asia',pop:1.1,infra:2,tier:4},

// ── Central Asia ──
{name:'Tashkent',lat:41.30,lng:69.28,region:'central-asia',pop:2.6,infra:2,tier:3},
{name:'Almaty',lat:43.24,lng:76.95,region:'central-asia',pop:2.0,infra:2,tier:3},
{name:'Astana',lat:51.17,lng:71.43,region:'central-asia',pop:1.3,infra:3,tier:4},
{name:'Kabul',lat:34.53,lng:69.17,region:'central-asia',pop:4.6,infra:1,tier:3},
{name:'Bishkek',lat:42.87,lng:74.59,region:'central-asia',pop:1.1,infra:1,tier:4},
{name:'Dushanbe',lat:38.56,lng:68.77,region:'central-asia',pop:1.0,infra:1,tier:4},

// ── Northern Europe ──
{name:'Stockholm',lat:59.33,lng:18.07,region:'northern-europe',pop:1.6,infra:5,tier:4},
{name:'Oslo',lat:59.91,lng:10.75,region:'northern-europe',pop:1.1,infra:5,tier:4},
{name:'Helsinki',lat:60.17,lng:24.94,region:'northern-europe',pop:1.3,infra:5,tier:4},
{name:'Copenhagen',lat:55.68,lng:12.57,region:'northern-europe',pop:1.4,infra:5,tier:4},
{name:'Dublin',lat:53.35,lng:-6.26,region:'northern-europe',pop:1.4,infra:4,tier:4},


// ── Western Europe ──
{name:'London',lat:51.51,lng:-0.13,region:'western-europe',pop:9.5,infra:5,tier:2},
{name:'Paris',lat:48.86,lng:2.35,region:'western-europe',pop:11.2,infra:5,tier:1},
{name:'Berlin',lat:52.52,lng:13.41,region:'western-europe',pop:3.7,infra:5,tier:3},
{name:'Madrid',lat:40.42,lng:-3.70,region:'western-europe',pop:6.8,infra:5,tier:2},
{name:'Barcelona',lat:41.39,lng:2.17,region:'western-europe',pop:5.6,infra:5,tier:2},
{name:'Amsterdam',lat:52.37,lng:4.90,region:'western-europe',pop:1.2,infra:5,tier:4},
{name:'Brussels',lat:50.85,lng:4.35,region:'western-europe',pop:2.1,infra:5,tier:3},
{name:'Munich',lat:48.14,lng:11.58,region:'western-europe',pop:1.6,infra:5,tier:4},
{name:'Milan',lat:45.46,lng:9.19,region:'western-europe',pop:3.1,infra:5,tier:3},
{name:'Rome',lat:41.90,lng:12.50,region:'western-europe',pop:4.3,infra:4,tier:3},
{name:'Vienna',lat:48.21,lng:16.37,region:'western-europe',pop:1.9,infra:5,tier:4},
{name:'Zurich',lat:47.38,lng:8.54,region:'western-europe',pop:1.4,infra:5,tier:4},
{name:'Hamburg',lat:53.55,lng:9.99,region:'western-europe',pop:1.9,infra:5,tier:4},
{name:'Lisbon',lat:38.72,lng:-9.14,region:'western-europe',pop:2.9,infra:4,tier:3},
{name:'Naples',lat:40.85,lng:14.27,region:'western-europe',pop:2.2,infra:3,tier:3},
{name:'Frankfurt',lat:50.11,lng:8.68,region:'western-europe',pop:1.4,infra:5,tier:4},
{name:'Lyon',lat:45.76,lng:4.84,region:'western-europe',pop:1.7,infra:5,tier:4},
{name:'Marseille',lat:43.30,lng:5.37,region:'western-europe',pop:1.6,infra:4,tier:4},
{name:'Athens',lat:37.98,lng:23.73,region:'western-europe',pop:3.2,infra:3,tier:3},
{name:'Porto',lat:41.16,lng:-8.63,region:'western-europe',pop:1.3,infra:4,tier:4},

// ── Eastern Europe ──
{name:'Moscow',lat:55.76,lng:37.62,region:'eastern-europe',pop:12.7,infra:3,tier:1},
{name:'St Petersburg',lat:59.93,lng:30.32,region:'eastern-europe',pop:5.6,infra:3,tier:2},
{name:'Kyiv',lat:50.45,lng:30.52,region:'eastern-europe',pop:3.0,infra:2,tier:3},
{name:'Warsaw',lat:52.23,lng:21.01,region:'eastern-europe',pop:1.8,infra:4,tier:4},
{name:'Bucharest',lat:44.43,lng:26.10,region:'eastern-europe',pop:1.8,infra:3,tier:4},
{name:'Budapest',lat:47.50,lng:19.04,region:'eastern-europe',pop:1.8,infra:4,tier:4},
{name:'Prague',lat:50.08,lng:14.44,region:'eastern-europe',pop:1.3,infra:5,tier:4},
{name:'Minsk',lat:53.90,lng:27.57,region:'eastern-europe',pop:2.0,infra:2,tier:3},
{name:'Belgrade',lat:44.79,lng:20.47,region:'eastern-europe',pop:1.4,infra:3,tier:4},
{name:'Sofia',lat:42.70,lng:23.32,region:'eastern-europe',pop:1.3,infra:3,tier:4},
{name:'Novosibirsk',lat:55.01,lng:82.93,region:'eastern-europe',pop:1.6,infra:2,tier:4},
{name:'Yekaterinburg',lat:56.84,lng:60.60,region:'eastern-europe',pop:1.5,infra:2,tier:4},
{name:'Kazan',lat:55.80,lng:49.11,region:'eastern-europe',pop:1.3,infra:3,tier:4},
{name:'Nizhny Novgorod',lat:56.33,lng:44.00,region:'eastern-europe',pop:1.2,infra:2,tier:4},
{name:'Samara',lat:53.20,lng:50.15,region:'eastern-europe',pop:1.2,infra:2,tier:4},
{name:'Rostov-on-Don',lat:47.24,lng:39.71,region:'eastern-europe',pop:1.1,infra:2,tier:4},

// ── North America ──
{name:'New York',lat:40.71,lng:-74.01,region:'north-america',pop:18.8,infra:5,tier:1},
{name:'Los Angeles',lat:34.05,lng:-118.24,region:'north-america',pop:12.5,infra:5,tier:1},
{name:'Chicago',lat:41.88,lng:-87.63,region:'north-america',pop:8.6,infra:5,tier:2},
{name:'Houston',lat:29.76,lng:-95.37,region:'north-america',pop:6.4,infra:5,tier:2},
{name:'Toronto',lat:43.65,lng:-79.38,region:'north-america',pop:6.3,infra:5,tier:2},
{name:'Dallas',lat:32.78,lng:-96.80,region:'north-america',pop:5.3,infra:5,tier:2},
{name:'Miami',lat:25.76,lng:-80.19,region:'north-america',pop:6.2,infra:5,tier:2},
{name:'Philadelphia',lat:39.95,lng:-75.17,region:'north-america',pop:5.7,infra:5,tier:2},
{name:'Washington DC',lat:38.91,lng:-77.04,region:'north-america',pop:5.4,infra:5,tier:2},
{name:'Atlanta',lat:33.75,lng:-84.39,region:'north-america',pop:5.1,infra:5,tier:2},
{name:'San Francisco',lat:37.77,lng:-122.42,region:'north-america',pop:3.3,infra:5,tier:3},
{name:'Boston',lat:42.36,lng:-71.06,region:'north-america',pop:4.3,infra:5,tier:3},
{name:'Phoenix',lat:33.45,lng:-112.07,region:'north-america',pop:4.0,infra:4,tier:3},
{name:'Montreal',lat:45.50,lng:-73.57,region:'north-america',pop:4.3,infra:5,tier:3},
{name:'Seattle',lat:47.61,lng:-122.33,region:'north-america',pop:3.5,infra:5,tier:3},
{name:'Denver',lat:39.74,lng:-104.99,region:'north-america',pop:2.9,infra:5,tier:3},
{name:'Vancouver',lat:49.28,lng:-123.12,region:'north-america',pop:2.6,infra:5,tier:3},
{name:'Detroit',lat:42.33,lng:-83.05,region:'north-america',pop:3.5,infra:4,tier:3},
{name:'Minneapolis',lat:44.98,lng:-93.27,region:'north-america',pop:2.7,infra:5,tier:3},
{name:'San Diego',lat:32.72,lng:-117.16,region:'north-america',pop:2.4,infra:5,tier:3},
{name:'Tampa',lat:27.95,lng:-82.46,region:'north-america',pop:2.4,infra:4,tier:3},
{name:'Calgary',lat:51.05,lng:-114.07,region:'north-america',pop:1.6,infra:5,tier:4},
{name:'Ottawa',lat:45.42,lng:-75.70,region:'north-america',pop:1.4,infra:5,tier:4},


// ── Central America & Caribbean ──
{name:'Mexico City',lat:19.43,lng:-99.13,region:'central-america',pop:21.8,infra:3,tier:1},
{name:'Guadalajara',lat:20.67,lng:-103.35,region:'central-america',pop:5.3,infra:3,tier:2},
{name:'Monterrey',lat:25.67,lng:-100.31,region:'central-america',pop:5.1,infra:3,tier:2},
{name:'Guatemala City',lat:14.63,lng:-90.51,region:'central-america',pop:3.0,infra:2,tier:3},
{name:'Havana',lat:23.11,lng:-82.37,region:'caribbean',pop:2.1,infra:1,tier:3},
{name:'Santo Domingo',lat:18.47,lng:-69.90,region:'caribbean',pop:3.5,infra:2,tier:3},
{name:'San Juan',lat:18.47,lng:-66.11,region:'caribbean',pop:2.3,infra:3,tier:3},
{name:'Panama City',lat:8.98,lng:-79.52,region:'central-america',pop:1.9,infra:3,tier:4},
{name:'San Jos\u00e9 CR',lat:9.93,lng:-84.08,region:'central-america',pop:1.4,infra:3,tier:4},
{name:'Tegucigalpa',lat:14.07,lng:-87.21,region:'central-america',pop:1.3,infra:1,tier:4},
{name:'San Salvador',lat:13.69,lng:-89.19,region:'central-america',pop:1.8,infra:2,tier:4},
{name:'Puebla',lat:19.04,lng:-98.21,region:'central-america',pop:3.2,infra:3,tier:3},
{name:'Le\u00f3n MX',lat:21.12,lng:-101.68,region:'central-america',pop:1.6,infra:3,tier:4},
{name:'Tijuana',lat:32.51,lng:-117.02,region:'central-america',pop:2.0,infra:2,tier:3},
{name:'Port-au-Prince',lat:18.54,lng:-72.34,region:'caribbean',pop:2.8,infra:1,tier:3},
{name:'Kingston',lat:18.00,lng:-76.79,region:'caribbean',pop:1.2,infra:2,tier:4},

// ── South America ──
{name:'S\u00e3o Paulo',lat:-23.55,lng:-46.63,region:'south-america',pop:22.4,infra:3,tier:1},
{name:'Buenos Aires',lat:-34.60,lng:-58.38,region:'south-america',pop:15.4,infra:3,tier:1},
{name:'Lima',lat:-12.05,lng:-77.04,region:'south-america',pop:11.0,infra:2,tier:1},
{name:'Bogot\u00e1',lat:4.71,lng:-74.07,region:'south-america',pop:11.3,infra:3,tier:1},
{name:'Rio de Janeiro',lat:-22.91,lng:-43.17,region:'south-america',pop:13.6,infra:3,tier:1},
{name:'Santiago',lat:-33.45,lng:-70.67,region:'south-america',pop:6.8,infra:4,tier:2},
{name:'Caracas',lat:10.48,lng:-66.90,region:'south-america',pop:2.9,infra:1,tier:3},
{name:'Medell\u00edn',lat:6.25,lng:-75.56,region:'south-america',pop:4.1,infra:3,tier:3},
{name:'Quito',lat:-0.18,lng:-78.47,region:'south-america',pop:2.0,infra:2,tier:3},
{name:'Bras\u00edlia',lat:-15.79,lng:-47.88,region:'south-america',pop:4.8,infra:3,tier:3},
{name:'Montevideo',lat:-34.88,lng:-56.16,region:'south-america',pop:1.8,infra:3,tier:4},
{name:'La Paz',lat:-16.50,lng:-68.15,region:'south-america',pop:1.9,infra:1,tier:4},
{name:'Asunci\u00f3n',lat:-25.26,lng:-57.58,region:'south-america',pop:2.5,infra:2,tier:3},


// ── North Africa ──
{name:'Cairo',lat:30.04,lng:31.24,region:'north-africa',pop:21.8,infra:2,tier:1},
{name:'Alexandria',lat:31.20,lng:29.92,region:'north-africa',pop:5.4,infra:2,tier:2},
{name:'Casablanca',lat:33.57,lng:-7.59,region:'north-africa',pop:3.8,infra:3,tier:3},
{name:'Algiers',lat:36.75,lng:3.04,region:'north-africa',pop:2.8,infra:2,tier:3},
{name:'Tunis',lat:36.81,lng:10.18,region:'north-africa',pop:2.4,infra:2,tier:3},
{name:'Tripoli',lat:32.90,lng:13.18,region:'north-africa',pop:1.2,infra:1,tier:4},
{name:'Rabat',lat:34.02,lng:-6.83,region:'north-africa',pop:1.9,infra:3,tier:4},
{name:'Fez',lat:34.03,lng:-5.00,region:'north-africa',pop:1.2,infra:2,tier:4},
{name:'Marrakech',lat:31.63,lng:-8.01,region:'north-africa',pop:1.0,infra:2,tier:4},

// ── West Africa ──
{name:'Lagos',lat:6.52,lng:3.38,region:'west-africa',pop:15.9,infra:1,tier:1},
{name:'Abuja',lat:9.06,lng:7.49,region:'west-africa',pop:3.6,infra:2,tier:3},
{name:'Accra',lat:5.56,lng:-0.19,region:'west-africa',pop:2.6,infra:2,tier:3},
{name:'Dakar',lat:14.72,lng:-17.47,region:'west-africa',pop:3.9,infra:2,tier:3},
{name:'Abidjan',lat:5.36,lng:-4.01,region:'west-africa',pop:5.4,infra:1,tier:2},
{name:'Bamako',lat:12.64,lng:-8.00,region:'west-africa',pop:2.9,infra:1,tier:3},

// ── East Africa ──
{name:'Nairobi',lat:-1.29,lng:36.82,region:'east-africa',pop:5.1,infra:2,tier:2},
{name:'Addis Ababa',lat:9.02,lng:38.75,region:'east-africa',pop:5.5,infra:1,tier:2},
{name:'Dar es Salaam',lat:-6.79,lng:39.28,region:'east-africa',pop:7.4,infra:1,tier:2},
{name:'Khartoum',lat:15.50,lng:32.56,region:'east-africa',pop:6.2,infra:1,tier:2},
{name:'Kampala',lat:0.35,lng:32.58,region:'east-africa',pop:3.7,infra:1,tier:3},
{name:'Kigali',lat:-1.94,lng:30.06,region:'east-africa',pop:1.2,infra:2,tier:4},
{name:'Antananarivo',lat:-18.88,lng:47.51,region:'east-africa',pop:3.4,infra:1,tier:3},
{name:'Lusaka',lat:-15.39,lng:28.32,region:'east-africa',pop:3.1,infra:1,tier:3},

// ── Central Africa ──
{name:'Kinshasa',lat:-4.44,lng:15.27,region:'central-africa',pop:17.1,infra:1,tier:1},
{name:'Luanda',lat:-8.84,lng:13.23,region:'central-africa',pop:8.9,infra:1,tier:2},
{name:'Douala',lat:4.05,lng:9.77,region:'central-africa',pop:3.8,infra:1,tier:3},
{name:'Brazzaville',lat:-4.27,lng:15.28,region:'central-africa',pop:2.4,infra:1,tier:3},

// ── Southern Africa ──
{name:'Johannesburg',lat:-26.20,lng:28.05,region:'southern-africa',pop:6.1,infra:3,tier:2},
{name:'Cape Town',lat:-33.93,lng:18.42,region:'southern-africa',pop:4.7,infra:3,tier:3},
{name:'Durban',lat:-29.86,lng:31.02,region:'southern-africa',pop:3.1,infra:3,tier:3},
{name:'Pretoria',lat:-25.75,lng:28.19,region:'southern-africa',pop:2.6,infra:3,tier:3},
{name:'Windhoek',lat:-22.57,lng:17.08,region:'southern-africa',pop:1.0,infra:2,tier:4},
{name:'Gaborone',lat:-24.65,lng:25.91,region:'southern-africa',pop:1.0,infra:2,tier:4},

// ── Oceania ──
{name:'Sydney',lat:-33.87,lng:151.21,region:'oceania',pop:5.4,infra:5,tier:2},
{name:'Melbourne',lat:-37.81,lng:144.96,region:'oceania',pop:5.1,infra:5,tier:2},
{name:'Brisbane',lat:-27.47,lng:153.03,region:'oceania',pop:2.6,infra:5,tier:3},
{name:'Perth',lat:-31.95,lng:115.86,region:'oceania',pop:2.1,infra:5,tier:3},
{name:'Auckland',lat:-36.85,lng:174.76,region:'oceania',pop:1.7,infra:5,tier:4},
{name:'Adelaide',lat:-34.93,lng:138.60,region:'oceania',pop:1.4,infra:5,tier:4},
{name:'Wellington',lat:-41.29,lng:174.78,region:'oceania',pop:1.0,infra:5,tier:4},
{name:'Gold Coast',lat:-28.02,lng:153.43,region:'oceania',pop:1.0,infra:5,tier:4},


// ══════════════════════════════════════════════════════════
// ── NEW CITIES — Balancing underrepresented continents ──
// ══════════════════════════════════════════════════════════

// ── Europe (additional) ──
{name:'Edinburgh',lat:55.95,lng:-3.19,region:'northern-europe',pop:1.0,infra:5,tier:4},
{name:'Glasgow',lat:55.86,lng:-4.25,region:'northern-europe',pop:1.0,infra:4,tier:4},
{name:'Reykjavik',lat:64.15,lng:-21.94,region:'northern-europe',pop:0.2,infra:4,tier:4},
{name:'Tallinn',lat:59.44,lng:24.75,region:'northern-europe',pop:0.5,infra:4,tier:4},
{name:'Riga',lat:56.95,lng:24.11,region:'eastern-europe',pop:0.6,infra:3,tier:4},
{name:'Vilnius',lat:54.69,lng:25.28,region:'eastern-europe',pop:0.6,infra:3,tier:4},
{name:'Zagreb',lat:45.81,lng:15.98,region:'eastern-europe',pop:0.8,infra:4,tier:4},
{name:'Bratislava',lat:48.15,lng:17.11,region:'eastern-europe',pop:0.5,infra:4,tier:4},
{name:'Ljubljana',lat:46.06,lng:14.51,region:'eastern-europe',pop:0.3,infra:4,tier:4},
{name:'Thessaloniki',lat:40.64,lng:22.94,region:'southern-europe',pop:1.1,infra:3,tier:4},

// ── Africa (additional) ──
{name:'Zanzibar',lat:-6.16,lng:39.19,region:'east-africa',pop:0.5,infra:1,tier:4},
{name:'Asmara',lat:15.34,lng:38.93,region:'east-africa',pop:0.9,infra:1,tier:4},
{name:'Djibouti',lat:11.59,lng:43.15,region:'east-africa',pop:0.6,infra:2,tier:4},
{name:'Libreville',lat:0.39,lng:9.45,region:'central-africa',pop:0.8,infra:2,tier:4},
{name:'Malabo',lat:3.75,lng:8.78,region:'central-africa',pop:0.3,infra:2,tier:4},
{name:'Bujumbura',lat:-3.38,lng:29.36,region:'east-africa',pop:1.0,infra:1,tier:4},
{name:'Moroni',lat:-11.70,lng:43.26,region:'east-africa',pop:0.1,infra:1,tier:4},
{name:'Port Louis',lat:-20.16,lng:57.50,region:'east-africa',pop:0.2,infra:3,tier:4},

// ── Americas (additional) ──
{name:'Anchorage',lat:61.22,lng:-149.90,region:'north-america',pop:0.3,infra:4,tier:4},
{name:'Honolulu',lat:21.31,lng:-157.86,region:'north-america',pop:1.0,infra:5,tier:4},
{name:'Edmonton',lat:53.55,lng:-113.49,region:'north-america',pop:1.5,infra:5,tier:4},
{name:'Winnipeg',lat:49.90,lng:-97.14,region:'north-america',pop:0.8,infra:4,tier:4},
{name:'Halifax',lat:44.65,lng:-63.57,region:'north-america',pop:0.4,infra:4,tier:4},
{name:'Paramaribo',lat:5.85,lng:-55.17,region:'south-america',pop:0.3,infra:2,tier:4},
{name:'Georgetown',lat:6.80,lng:-58.16,region:'south-america',pop:0.2,infra:2,tier:4},
{name:'Sucre',lat:-19.04,lng:-65.26,region:'south-america',pop:0.3,infra:1,tier:4},
{name:'Arequipa',lat:-16.41,lng:-71.54,region:'south-america',pop:1.1,infra:2,tier:4},
{name:'Valparaiso',lat:-33.05,lng:-71.62,region:'south-america',pop:1.0,infra:3,tier:4},

// ── Oceania (additional) ──
{name:'Christchurch',lat:-43.53,lng:172.64,region:'oceania',pop:0.4,infra:5,tier:4},
{name:'Hobart',lat:-42.88,lng:147.33,region:'oceania',pop:0.3,infra:4,tier:4},
{name:'Darwin',lat:-12.46,lng:130.84,region:'oceania',pop:0.1,infra:3,tier:4},
{name:'Suva',lat:-18.14,lng:178.44,region:'oceania',pop:0.1,infra:2,tier:4},
{name:'Port Moresby',lat:-9.48,lng:147.15,region:'oceania',pop:0.4,infra:1,tier:4},
{name:'Noumea',lat:-22.28,lng:166.46,region:'oceania',pop:0.1,infra:3,tier:4},
];