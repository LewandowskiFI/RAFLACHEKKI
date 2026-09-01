import fetch from 'node-fetch';

const DAY_NAMES_FI = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];

export async function fetchIlokiviMenu(targetDateStr) {
  try {
    const url = 'https://www.ilokivi.fi/ravintola/lounas/';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 6000
    });

    if (!res.ok) {
      throw new Error(`Ilokivi responded with status ${res.status}`);
    }

    const html = await res.text();
    
    // Parse target day
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const dayOfWeekIndex = targetDate.getDay();
    const dayName = DAY_NAMES_FI[dayOfWeekIndex]; // e.g. "tiistai"
    const targetDayOfMonth = targetDate.getDate(); // e.g. 1
    const targetMonth = targetDate.getMonth() + 1; // e.g. 9

    // Find lunch-box divs
    const lunchBoxesRegex = /<div class=["']lunch-box["']>(.*?)<\/div>\s*<\/div>/gis;
    let match;
    const daysData = [];

    // Alternative simpler regex matching lunch-box blocks
    const blocks = html.split('<div class="lunch-box">');
    blocks.shift(); // remove header

    for (const block of blocks) {
      const headMatch = block.match(/<h3>([^<]+)<\/h3>/i);
      const isToday = block.includes('category-badge') || block.includes('Tänään');
      const headerText = headMatch ? headMatch[1].trim() : '';

      // Extract content paragraph
      const contentMatch = block.match(/<div class=["']content["']>\s*<p>(.*?)<\/p>/is);
      const contentHtml = contentMatch ? contentMatch[1] : '';

      // Parse lines separated by <br /> or <br>
      const rawLines = contentHtml.split(/<br\s*\/?>/i);
      const meals = [];

      for (const line of rawLines) {
        const text = line.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!text) continue;

        // Extract diets from <i> tags or text
        const dietMatch = line.match(/<i>(.*?)<\/i>/i);
        let diets = [];
        if (dietMatch) {
          diets = dietMatch[1].split(',').map(d => d.trim()).filter(Boolean);
        } else {
          // Check common tags in string
          const inlineDiets = text.match(/\b(VEG|VEGAN|G|L|M|VL|\*|ILMASTO|SYDÄNMERKKI)\b/gi);
          if (inlineDiets) diets = inlineDiets.map(d => d.trim());
        }

        // Clean dish name
        let dishName = line.replace(/<i>.*?<\/i>/gi, '').replace(/<[^>]+>/g, '').trim();
        dishName = dishName.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();

        if (dishName.length > 2) {
          const isClimate = diets.some(d => d.toLowerCase().includes('ilmast'));
          const isHeart = diets.some(d => d.includes('*') || d.toLowerCase().includes('sydän'));

          meals.push({
            name: dishName,
            diets: diets.map(d => d.toUpperCase()),
            allergens: [],
            isClimate,
            isHeart
          });
        }
      }

      if (meals.length > 0) {
        daysData.push({
          header: headerText,
          isToday,
          meals
        });
      }
    }

    // Match the target day
    let matchedDay = null;
    if (daysData.length > 0) {
      // 1. Try matching header containing day name or date (e.g. "Tiistai 1.9." or "tiistai")
      matchedDay = daysData.find(d => 
        d.header.toLowerCase().includes(dayName) || 
        d.header.includes(`${targetDayOfMonth}.${targetMonth}.`)
      );

      // 2. If today requested and not found by exact string, look for isToday flag
      if (!matchedDay && daysData.some(d => d.isToday)) {
        matchedDay = daysData.find(d => d.isToday);
      }

      // 3. Fallback to closest available day
      if (!matchedDay && daysData.length > 0) {
        matchedDay = daysData[0];
      }
    }

    if (!matchedDay || matchedDay.meals.length === 0) {
      return { success: false, packages: [], message: 'No menu for requested date' };
    }

    const allDiets = Array.from(new Set(matchedDay.meals.flatMap(m => m.diets)));

    // Group meals into sensible lunch packages
    const packages = matchedDay.meals.map((meal, idx) => ({
      id: `ilokivi-pkg-${idx}`,
      title: meal.name,
      price: '3,10 € (Opiskelija)',
      meals: [meal],
      diets: meal.diets,
      isVegetarian: meal.diets.some(d => ['VEG', 'VEGAN', 'KASVIS'].includes(d)),
      isVegan: meal.diets.some(d => ['VEG', 'VEGAN'].includes(d)),
      isGlutenFree: meal.diets.some(d => ['G', 'GL'].includes(d)),
      isLactoseFree: meal.diets.some(d => ['L', 'M', 'VL'].includes(d))
    }));

    return {
      success: true,
      dayHeader: matchedDay.header,
      packages
    };
  } catch (err) {
    console.error('[Ilokivi Scraper] Error:', err.message);
    return { success: false, packages: [], error: err.message };
  }
}
