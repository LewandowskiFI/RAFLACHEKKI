import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import DateSelector from './components/DateSelector';
import CampusFilter from './components/CampusFilter';
import DietFilter from './components/DietFilter';
import StatsBar from './components/StatsBar';
import RestaurantCard from './components/RestaurantCard';
import LunchRoulette from './components/LunchRoulette';
import RestaurantModal from './components/RestaurantModal';
import { CAMPUSES, DIET_FILTERS, RESTAURANTS } from '../server/data/restaurants.js';
import preloadedData from '../server/data/menus_latest.json';
import { Sparkles, Utensils, AlertTriangle, RefreshCw } from 'lucide-react';

function getTodayDateStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Build initial restaurant list from bundled preloaded data
function getPreloadedRestaurantsForDate(dateStr) {
  const menusForDate = preloadedData.menusByDate?.[dateStr] || {};
  
  return RESTAURANTS.map(r => {
    const dayMenu = menusForDate[r.id];
    const packages = dayMenu?.packages || [];

    return {
      ...r,
      openStatus: {
        isOpen: true,
        isLunchActive: true,
        statusText: r.openHours?.lunch ? `Lounas ${r.openHours.lunch}` : 'Avoinna',
        badgeColor: 'emerald'
      },
      menu: {
        success: packages.length > 0,
        packages
      },
      date: dateStr
    };
  });
}

export default function App() {
  // State
  const [theme, setTheme] = useState(() => localStorage.getItem('raflachekki_theme') || 'dark');
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedDiets, setSelectedDiets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('raflachekki_favs') || '[]');
    } catch {
      return [];
    }
  });

  // Initialize with preloaded data immediately for 0ms initial load
  const [restaurants, setRestaurants] = useState(() => getPreloadedRestaurantsForDate(getTodayDateStr()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [modalRestaurant, setModalRestaurant] = useState(null);

  // Set theme attribute on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('raflachekki_favs', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch menus when date changes
  const fetchMenus = async (date) => {
    // Immediately set preloaded data if available so user sees content instantly
    const fallbackList = getPreloadedRestaurantsForDate(date);
    if (fallbackList.some(r => r.menu?.packages?.length > 0)) {
      setRestaurants(fallbackList);
    }

    try {
      const res = await fetch(`/api/menus?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        if (data.restaurants && data.restaurants.length > 0) {
          setRestaurants(data.restaurants);
          setError(null);
        }
      }
    } catch (err) {
      // If API fails, we already have fallback data rendered
      console.log('Using preloaded fallback data');
    }
  };

  useEffect(() => {
    fetchMenus(selectedDate);
  }, [selectedDate]);

  // Toggle favorite
  const toggleFavorite = (restaurantId) => {
    setFavorites(prev => 
      prev.includes(restaurantId) 
        ? prev.filter(id => id !== restaurantId) 
        : [...prev, restaurantId]
    );
  };

  // Toggle diet filter
  const toggleDiet = (dietId) => {
    setSelectedDiets(prev => 
      prev.includes(dietId) 
        ? prev.filter(d => d !== dietId) 
        : [...prev, dietId]
    );
  };

  // Restaurant count per campus
  const restaurantCounts = useMemo(() => {
    const counts = { all: restaurants.length };
    for (const r of restaurants) {
      counts[r.campus] = (counts[r.campus] || 0) + 1;
    }
    return counts;
  }, [restaurants]);

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      // Campus filter
      if (selectedCampus !== 'all' && r.campus !== selectedCampus) {
        return false;
      }

      // Favorites only
      if (onlyFavorites && !favorites.includes(r.id)) {
        return false;
      }

      // Open now filter
      if (onlyOpenNow && !r.openStatus?.isOpen) {
        return false;
      }

      // Search query filter (matches restaurant name, building, or meal names)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = r.name.toLowerCase().includes(query) || (r.building && r.building.toLowerCase().includes(query));
        const packages = r.menu?.packages || [];
        const mealMatch = packages.some(p => 
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.meals && p.meals.some(m => m.name && m.name.toLowerCase().includes(query)))
        );

        if (!nameMatch && !mealMatch) {
          return false;
        }
      }

      // Diet filters
      if (selectedDiets.length > 0) {
        const packages = r.menu?.packages || [];
        if (packages.length === 0) return false;

        const satisfiesDiet = packages.some(pkg => {
          return selectedDiets.every(dietId => {
            if (dietId === 'Veg') return pkg.isVegan || pkg.isVegetarian;
            if (dietId === 'G') return pkg.isGlutenFree;
            if (dietId === 'L') return pkg.isLactoseFree;
            if (dietId === 'M') return (pkg.diets || []).includes('M') || pkg.isVegan;
            if (dietId === 'ILM') return (pkg.diets || []).some(d => ['ILM', 'ILMASTO'].includes(d));
            if (dietId === 'SYD') return (pkg.diets || []).some(d => ['*', 'SYD', 'SYDÄNMERKKI'].includes(d));
            return (pkg.diets || []).includes(dietId);
          });
        });

        if (!satisfiesDiet) return false;
      }

      return true;
    }).sort((a, b) => {
      // Pinned favorites first
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      return 0;
    });
  }, [restaurants, selectedCampus, onlyFavorites, onlyOpenNow, searchQuery, selectedDiets, favorites]);

  return (
    <div className="app-wrapper">
      {/* Navigation Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        onlyFavorites={onlyFavorites}
        setOnlyFavorites={setOnlyFavorites}
        favoritesCount={favorites.length}
        onOpenRoulette={() => setRouletteOpen(true)}
        onRefresh={() => fetchMenus(selectedDate)}
        loading={loading}
      />

      <main className="main-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Kaikki lounaat yhdestä osoitteesta</span>
          </div>
          <h1 className="hero-title">
            Mitä tänään <span>lounaaksi?</span>
          </h1>
          <p className="hero-description">
            Tarkista kaikkien Jyväskylän opiskelijaravintoloiden päivän ruokalistat, aukioloajat ja Kelan opiskelijahinnat (3,10 €).
          </p>

          {/* Date Selector */}
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </section>

        {/* Stats Row */}
        <StatsBar
          restaurants={filteredRestaurants}
          allRestaurantsCount={restaurants.length}
        />

        {/* Filter Controls Box */}
        <div className="glass-card filter-box">
          {/* Campus Selector */}
          <CampusFilter
            campuses={CAMPUSES}
            selectedCampus={selectedCampus}
            onSelectCampus={setSelectedCampus}
            restaurantCounts={restaurantCounts}
          />

          {/* Search and Diet Tags */}
          <DietFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedDiets={selectedDiets}
            onToggleDiet={toggleDiet}
            onlyOpenNow={onlyOpenNow}
            setOnlyOpenNow={setOnlyOpenNow}
          />
        </div>

        {/* Empty State */}
        {filteredRestaurants.length === 0 && (
          <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', margin: '2rem 0' }}>
            <Utensils size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Ei hakuehtoja vastaavia ravintoloita</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Kokeile nollata suodattimet tai etsi toiselta kampukselta.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedCampus('all');
                setSelectedDiets([]);
                setSearchQuery('');
                setOnlyOpenNow(false);
                setOnlyFavorites(false);
              }}
            >
              Nollaa kaikki suodattimet
            </button>
          </div>
        )}

        {/* Restaurant Cards Grid */}
        {filteredRestaurants.length > 0 && (
          <div className="restaurant-grid">
            {filteredRestaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFavorite={favorites.includes(restaurant.id)}
                onToggleFavorite={toggleFavorite}
                onOpenDetails={setModalRestaurant}
              />
            ))}
          </div>
        )}
      </main>

      {/* Roulette Modal */}
      <LunchRoulette
        isOpen={rouletteOpen}
        onClose={() => setRouletteOpen(false)}
        restaurants={restaurants}
        campuses={CAMPUSES}
      />

      {/* Restaurant Detail Modal */}
      <RestaurantModal
        restaurant={modalRestaurant}
        onClose={() => setModalRestaurant(null)}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            <Utensils size={18} color="var(--primary)" />
            <span>RAFLACHEKKI</span>
          </div>
          <p>
            Jyväskylän yliopiston (JYU), JAMK:n ja Gradia-opiskelijoiden lounasopas.
          </p>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            Tiedot haetaan ja päivitetään automaattisesti Semman, Compass Groupin, Ilokiven ja Juveneksen virallisista järjestelmistä.
          </div>
        </div>
      </footer>
    </div>
  );
}
