import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { RESTAURANTS, CAMPUSES, DIET_FILTERS } from './data/restaurants.js';
import { fetchSemmaMenu, fetchSemmaWeekMenu } from './scrapers/semma.js';
import { fetchCompassMenu } from './scrapers/compass.js';
import { fetchIlokiviMenu } from './scrapers/ilokivi.js';
import { fetchJuvenesMenu } from './scrapers/juvenes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory cache for menus
const menuCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getTodayDateStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate open status based on current Finnish local time
function calculateOpenStatus(restaurant) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      isOpen: false,
      isLunchActive: false,
      statusText: 'Suljettu viikonloppuna',
      badgeColor: 'gray'
    };
  }

  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeMin = currentHours * 60 + currentMinutes;

  if (!restaurant.lunchHours) {
    return {
      isOpen: true,
      isLunchActive: true,
      statusText: 'Avoinna',
      badgeColor: 'green'
    };
  }

  const [startH, startM] = restaurant.lunchHours.start.split(':').map(Number);
  const [endH, endM] = restaurant.lunchHours.end.split(':').map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  if (currentTimeMin >= startMin && currentTimeMin < endMin) {
    const minsLeft = endMin - currentTimeMin;
    const endingSoon = minsLeft <= 30;
    return {
      isOpen: true,
      isLunchActive: true,
      statusText: endingSoon ? `Lounas päättyy ${restaurant.lunchHours.end} (${minsLeft} min)` : `Lounas tarjolla klo ${restaurant.lunchHours.end} asti`,
      badgeColor: endingSoon ? 'amber' : 'emerald'
    };
  } else if (currentTimeMin < startMin) {
    return {
      isOpen: false,
      isLunchActive: false,
      statusText: `Lounas alkaa klo ${restaurant.lunchHours.start}`,
      badgeColor: 'blue'
    };
  } else {
    return {
      isOpen: false,
      isLunchActive: false,
      statusText: `Lounas päättynyt klo ${restaurant.lunchHours.end}`,
      badgeColor: 'gray'
    };
  }
}

// Fetch single restaurant menu with caching
async function getRestaurantMenu(restaurant, dateStr) {
  const cacheKey = `${restaurant.id}_${dateStr}`;
  const cached = menuCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  let menuResult = { success: false, packages: [] };

  try {
    if (restaurant.provider === 'semma' && restaurant.costCenter) {
      menuResult = await fetchSemmaMenu(restaurant.costCenter, dateStr);
    } else if (restaurant.provider === 'compass' && restaurant.costCenter) {
      menuResult = await fetchCompassMenu(restaurant.costCenter, dateStr);
    } else if (restaurant.provider === 'ilokivi') {
      menuResult = await fetchIlokiviMenu(dateStr);
    } else if (restaurant.provider === 'juvenes') {
      menuResult = await fetchJuvenesMenu(
        restaurant.id,
        restaurant.jamixKitchen || '60',
        restaurant.jamixMenuType || '100',
        dateStr
      );
    }
  } catch (err) {
    console.error(`Error fetching menu for ${restaurant.name}:`, err.message);
  }

  const combined = {
    ...restaurant,
    openStatus: calculateOpenStatus(restaurant),
    menu: menuResult,
    date: dateStr,
    fetchedAt: new Date().toISOString()
  };

  menuCache.set(cacheKey, {
    timestamp: Date.now(),
    data: combined
  });

  return combined;
}

// REST API Endpoints

// 1. Meta / info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'RAFLACHEKKI API',
    version: '1.0.0',
    description: 'Jyväskylän opiskelijaravintoloiden reaaliaikainen ruokalistapalvelu',
    campuses: CAMPUSES,
    dietFilters: DIET_FILTERS,
    totalRestaurants: RESTAURANTS.length
  });
});

// 2. List all restaurants
app.get('/api/restaurants', (req, res) => {
  const list = RESTAURANTS.map(r => ({
    ...r,
    openStatus: calculateOpenStatus(r)
  }));
  res.json(list);
});

// 3. Fetch all menus for given date (default today)
app.get('/api/menus', async (req, res) => {
  const dateStr = req.query.date || getTodayDateStr();
  const campusFilter = req.query.campus;

  let targetRestaurants = RESTAURANTS;
  if (campusFilter && campusFilter !== 'all') {
    targetRestaurants = RESTAURANTS.filter(r => r.campus === campusFilter);
  }

  try {
    const promises = targetRestaurants.map(r => getRestaurantMenu(r, dateStr));
    const results = await Promise.all(promises);

    res.json({
      date: dateStr,
      count: results.length,
      restaurants: results
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load menus', details: err.message });
  }
});

// 4. Fetch single restaurant menu
app.get('/api/menus/:id', async (req, res) => {
  const restaurant = RESTAURANTS.find(r => r.id === req.params.id);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  const dateStr = req.query.date || getTodayDateStr();
  try {
    const data = await getRestaurantMenu(restaurant, dateStr);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurant menu', details: err.message });
  }
});

// 5. Lunch roulette: Pick a random meal package
app.get('/api/roulette', async (req, res) => {
  const dateStr = req.query.date || getTodayDateStr();
  const campus = req.query.campus;
  const diet = req.query.diet;

  let targetRestaurants = RESTAURANTS;
  if (campus && campus !== 'all') {
    targetRestaurants = RESTAURANTS.filter(r => r.campus === campus);
  }

  const promises = targetRestaurants.map(r => getRestaurantMenu(r, dateStr));
  const results = await Promise.all(promises);

  const candidates = [];

  for (const r of results) {
    const packages = r.menu?.packages || [];
    for (const pkg of packages) {
      if (diet) {
        if (diet === 'Veg' && !pkg.isVegan && !pkg.isVegetarian) continue;
        if (diet === 'G' && !pkg.isGlutenFree) continue;
        if (diet === 'L' && !pkg.isLactoseFree) continue;
      }

      candidates.push({
        restaurantId: r.id,
        restaurantName: r.name,
        campus: r.campusName,
        building: r.building,
        address: r.address,
        mapsUrl: r.mapsUrl,
        studentPrice: r.studentPrice,
        lunchHours: r.openHours.lunch,
        openStatus: r.openStatus,
        package: pkg
      });
    }
  }

  if (candidates.length === 0) {
    return res.json({ found: false, message: 'Ei löytynyt hakuehtoja vastaavaa lounasta' });
  }

  const randomChoice = candidates[Math.floor(Math.random() * candidates.length)];
  res.json({
    found: true,
    totalCandidates: candidates.length,
    selection: randomChoice
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 RAFLACHEKKI API server running at http://localhost:${PORT}`);
});
