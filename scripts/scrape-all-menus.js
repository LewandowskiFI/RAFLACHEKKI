import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { RESTAURANTS } from '../server/data/restaurants.js';
import { fetchSemmaMenu, fetchSemmaWeekMenu } from '../server/scrapers/semma.js';
import { fetchCompassMenu } from '../server/scrapers/compass.js';
import { fetchIlokiviMenu } from '../server/scrapers/ilokivi.js';
import { fetchJuvenesMenu } from '../server/scrapers/juvenes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get week dates (Monday to Friday)
function getCurrentWeekDates() {
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

async function scrapeAll() {
  console.log('====================================================');
  console.log('🍲 RAFLACHEKKI - Automaattinen Ruokalistojen Kaivaja');
  console.log('====================================================\n');

  const weekDates = getCurrentWeekDates();
  console.log(`📅 Haetaan ruokalistat viikon päiville: ${weekDates.join(', ')}\n`);

  const allData = {
    updatedAt: new Date().toISOString(),
    dates: weekDates,
    totalRestaurants: RESTAURANTS.length,
    restaurants: RESTAURANTS.map(r => ({
      id: r.id,
      name: r.name,
      campus: r.campus,
      campusName: r.campusName,
      building: r.building,
      address: r.address,
      operator: r.operator,
      openHours: r.openHours,
      lunchHours: r.lunchHours,
      studentPrice: r.studentPrice,
      staffPrice: r.staffPrice,
      guestPrice: r.guestPrice,
      website: r.website,
      mapsUrl: r.mapsUrl,
      description: r.description,
      highlights: r.highlights
    })),
    menusByDate: {}
  };

  // Initialize dates
  for (const date of weekDates) {
    allData.menusByDate[date] = {};
  }

  let totalScrapedMeals = 0;

  for (const restaurant of RESTAURANTS) {
    console.log(`🔍 Käsitellään: ${restaurant.name} (${restaurant.campusName} - ${restaurant.operator})...`);

    // For Semma / Compass, try fetching week menu first for speed
    let weekMenuMap = new Map();
    if (restaurant.provider === 'semma' && restaurant.costCenter) {
      const weekRes = await fetchSemmaWeekMenu(restaurant.costCenter, weekDates[0]);
      if (weekRes.success && Array.isArray(weekRes.menus)) {
        for (const dayMenu of weekRes.menus) {
          const dateStr = (dayMenu.date || '').split('T')[0];
          if (dateStr) {
            // format packages
            const packages = (dayMenu.menuPackages || []).map((pkg, idx) => {
              const meals = (pkg.meals || []).map(m => ({
                name: (m.name || '').trim(),
                diets: (m.diets || []).map(d => String(d).trim()).filter(Boolean),
                allergens: (m.allergens || []).map(a => String(a).trim()).filter(Boolean),
                isClimate: (m.diets || []).includes('ILM') || (m.climateImpact && m.climateImpact.isClimateFriendly),
                isHeart: (m.diets || []).includes('*') || (m.diets || []).includes('SYD')
              })).filter(m => m.name.length > 0);

              if (meals.length === 0) return null;
              const allDiets = Array.from(new Set(meals.flatMap(m => m.diets)));
              return {
                id: `pkg-${idx}`,
                title: pkg.packageName ? pkg.packageName.trim() : (meals[0]?.name || `Lounas ${idx + 1}`),
                price: pkg.price || restaurant.studentPrice,
                meals,
                diets: allDiets,
                isVegetarian: allDiets.some(d => ['Veg', 'VEG', 'Kasvis'].includes(d)),
                isVegan: allDiets.some(d => ['Veg', 'VEG', 'Vegaani'].includes(d)),
                isGlutenFree: allDiets.some(d => ['G', 'GL'].includes(d)),
                isLactoseFree: allDiets.some(d => ['L', 'M', 'VL'].includes(d))
              };
            }).filter(Boolean);

            if (packages.length > 0) {
              weekMenuMap.set(dateStr, packages);
            }
          }
        }
      }
    }

    for (const date of weekDates) {
      let packages = weekMenuMap.get(date);

      if (!packages) {
        // Fallback to day fetchers
        try {
          if (restaurant.provider === 'semma' && restaurant.costCenter) {
            const res = await fetchSemmaMenu(restaurant.costCenter, date);
            packages = res.packages || [];
          } else if (restaurant.provider === 'compass' && restaurant.costCenter) {
            const res = await fetchCompassMenu(restaurant.costCenter, date);
            packages = res.packages || [];
          } else if (restaurant.provider === 'ilokivi') {
            const res = await fetchIlokiviMenu(date);
            packages = res.packages || [];
          } else if (restaurant.provider === 'juvenes') {
            const res = await fetchJuvenesMenu(
              restaurant.id,
              restaurant.jamixKitchen || '60',
              restaurant.jamixMenuType || '100',
              date
            );
            packages = res.packages || [];
          }
        } catch (err) {
          console.error(`  Virhe ravintolalle ${restaurant.id} (${date}):`, err.message);
          packages = [];
        }
      }

      packages = packages || [];
      totalScrapedMeals += packages.length;

      allData.menusByDate[date][restaurant.id] = {
        success: packages.length > 0,
        packages,
        fetchedAt: new Date().toISOString()
      };
    }

    console.log(`  ✅ Valmis: ${restaurant.name}`);
  }

  // Save to JSON files
  const dataDir = path.join(__dirname, '../server/data');
  const targetLatestPath = path.join(dataDir, 'menus_latest.json');
  const targetWeekPath = path.join(dataDir, 'menus_week.json');

  await fs.writeFile(targetLatestPath, JSON.stringify(allData, null, 2), 'utf-8');
  await fs.writeFile(targetWeekPath, JSON.stringify(allData, null, 2), 'utf-8');

  console.log('\n====================================================');
  console.log(`🎉 Valmista! Tallennettu ${totalScrapedMeals} lounaspakettia tiedostoon:`);
  console.log(`   📁 ${targetLatestPath}`);
  console.log(`   📁 ${targetWeekPath}`);
  console.log('====================================================\n');
}

scrapeAll().catch(err => {
  console.error('Scraping error:', err);
  process.exit(1);
});
