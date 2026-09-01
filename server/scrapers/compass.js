import fetch from 'node-fetch';

export async function fetchCompassMenu(costCenter, dateStr) {
  try {
    const url = `https://www.compass-group.fi/menuapi/day-menus?costCenter=${costCenter}&date=${dateStr}&language=fi`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept': 'application/json'
      },
      timeout: 5000
    });

    if (!res.ok) {
      throw new Error(`Compass API responded with status ${res.status}`);
    }

    const data = await res.json();
    if (!data || data.errorText || data.ErrorText) {
      return { success: false, packages: [], raw: data };
    }

    const packages = (data.menuPackages || []).map((pkg, idx) => {
      const meals = (pkg.meals || []).map(m => {
        const name = (m.name || '').trim();
        const diets = (m.diets || []).map(d => String(d).trim()).filter(Boolean);
        const allergens = (m.allergens || []).map(a => String(a).trim()).filter(Boolean);
        const isClimate = diets.includes('ILM') || (m.climateImpact && m.climateImpact.isClimateFriendly);
        const isHeart = diets.includes('*') || diets.includes('SYD') || m.isHeartSymbol;

        return {
          name,
          diets,
          allergens,
          recipeUrl: m.recipeUrl || null,
          isClimate,
          isHeart,
          co2: m.climateImpact ? m.climateImpact.co2Formatted : null
        };
      }).filter(m => m.name.length > 0);

      if (meals.length === 0) return null;

      const allDiets = Array.from(new Set(meals.flatMap(m => m.diets)));
      const title = pkg.packageName ? pkg.packageName.trim() : (meals[0]?.name || `Lounas ${idx + 1}`);

      return {
        id: `pkg-${idx}`,
        title,
        price: pkg.price || '3,10 €',
        meals,
        diets: allDiets,
        isVegetarian: allDiets.some(d => ['Veg', 'VEG', 'Kasvis'].includes(d)),
        isVegan: allDiets.some(d => ['Veg', 'VEG', 'Vegaani'].includes(d)),
        isGlutenFree: allDiets.some(d => ['G', 'GL'].includes(d)),
        isLactoseFree: allDiets.some(d => ['L', 'M', 'VL'].includes(d))
      };
    }).filter(Boolean);

    return {
      success: true,
      dayOfWeek: data.dayOfWeek,
      date: data.date,
      packages
    };
  } catch (err) {
    console.error(`[Compass Scraper] Error fetching CC ${costCenter}:`, err.message);
    return { success: false, packages: [], error: err.message };
  }
}
