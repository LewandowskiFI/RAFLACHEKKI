import React from 'react';
import { Heart, MapPin, ExternalLink, Info, AlertCircle } from 'lucide-react';

const CATEGORY_NAMES = [
  'LOUNAS',
  'KASVISLOUNAS',
  'VEGAANI',
  'KASVIS',
  'MY SOUP',
  'SOUP',
  'KEITTO',
  'KEITTOLOUNAS',
  'BUFFET',
  'KASVISBUFFET',
  'KOTIRUOKA',
  'ERIKOISLOUNAS',
  'SPECIAL',
  'SWEET',
  'DESSERT',
  'JÄLKIRUOKA',
  'GRILL',
  'FUSION',
  'BISTRO',
  'SALAATTI',
  'SALAATTIBAARI',
  'DELI',
  'HERKKU'
];

// Clean, deduplicate and consolidate menu packages
function processPackages(packages, studentPrice) {
  if (!packages || !Array.isArray(packages)) return [];

  const seenKeys = new Set();
  const result = [];

  for (const pkg of packages) {
    const rawTitle = (pkg.title || '').trim();
    const meals = (pkg.meals || []).filter(m => m && m.name && m.name.trim().length > 0);
    const mainMealName = meals[0]?.name?.trim() || rawTitle;

    if (!mainMealName) continue;

    // Normalizing key for deduplication
    const cleanKey = mainMealName.toLowerCase().replace(/[^a-z0-9äöå]/g, '');

    // Skip exact duplicate meals (e.g. repeated desserts or duplicate soup lines from Compass/Semma)
    if (seenKeys.has(cleanKey)) {
      continue;
    }

    // Skip duplicate variant lines like "Kanapyöryköitä (gluteeniton)" if base "Kanapyöryköitä" already exists
    if (mainMealName.toLowerCase().includes('(gluteeniton)') || mainMealName.toLowerCase().includes('(maidoton)')) {
      const baseKey = mainMealName.replace(/\s*\([^)]*\)\s*/g, '').trim().toLowerCase().replace(/[^a-z0-9äöå]/g, '');
      if (seenKeys.has(baseKey)) {
        continue;
      }
    }

    // Skip minor standalone condiments (like Puolukkahilloa, Satokauden kasviksia) if there are multiple full meals
    const isMinorCondiment = /^(puolukkahilloa|satokauden kasviksia|leipärasvaa|salaatinkastiketta)$/i.test(mainMealName);
    if (isMinorCondiment && packages.length > 2) {
      continue;
    }

    seenKeys.add(cleanKey);
    result.push({
      ...pkg,
      rawTitle,
      meals,
      mainMealName
    });
  }

  return result;
}

export default function RestaurantCard({
  restaurant,
  isFavorite,
  onToggleFavorite,
  onOpenDetails
}) {
  const {
    id,
    name,
    campusName,
    building,
    operator,
    studentPrice,
    openHours,
    openStatus,
    menu,
    mapsUrl,
    website
  } = restaurant;

  const rawPackages = (menu && Array.isArray(menu.packages)) ? menu.packages : [];
  const packages = processPackages(rawPackages, studentPrice);
  const hasMenu = packages.length > 0;

  // Render diet badge with clean compact pill
  const renderDietBadge = (diet, keyPrefix = '') => {
    const raw = String(diet).trim();
    const d = raw.toUpperCase();

    // Heart Symbol
    if (['*', 'SYD', 'SYDÄN', 'SYDÄNMERKKI'].includes(d) || d.includes('SYDÄN')) {
      return <span key={`${keyPrefix}-syd-${diet}`} className="diet-badge diet-badge-syd" title="Sydänmerkki">❤️</span>;
    }
    // Vegan & Vegetarian
    if (['VEG', 'VEGAN', 'KASVIS'].includes(d)) {
      return <span key={`${keyPrefix}-veg-${diet}`} className="diet-badge diet-badge-veg" title="Vegaani / Kasvis">VEG</span>;
    }
    // Gluten-free
    if (['G', 'GL'].includes(d)) {
      return <span key={`${keyPrefix}-g-${diet}`} className="diet-badge diet-badge-g" title="Gluteeniton">G</span>;
    }
    // Lactose-free
    if (['L', 'VL'].includes(d)) {
      return <span key={`${keyPrefix}-l-${diet}`} className="diet-badge diet-badge-l" title="Laktoositon">L</span>;
    }
    // Dairy-free / Milk-free
    if (['M', 'MAIDOTON'].includes(d)) {
      return <span key={`${keyPrefix}-m-${diet}`} className="diet-badge diet-badge-m" title="Maidoton">M</span>;
    }
    // Climate friendly
    if (['ILM', 'ILMASTO'].includes(d) || d.includes('ILMASTO')) {
      return <span key={`${keyPrefix}-ilm-${diet}`} className="diet-badge diet-badge-ilm" title="Ilmastoystävällinen">🌱 ILM</span>;
    }
    // Filter out internal noisy codes
    if (d === 'A') return null;
    if (d === 'SIS.LUOMUA' || d === 'LUOMU') {
      return <span key={`${keyPrefix}-luomu-${diet}`} className="diet-badge diet-badge-organic" title="Sisältää luomua">LUOMU</span>;
    }
    if (d === 'VS') {
      return <span key={`${keyPrefix}-vs-${diet}`} className="diet-badge diet-badge-vs" title="Valkosipuli">VS</span>;
    }
    if (d === 'MU') {
      return <span key={`${keyPrefix}-mu-${diet}`} className="diet-badge diet-badge-mu" title="Munaton">Mu</span>;
    }

    return (
      <span key={`${keyPrefix}-def-${diet}`} className="diet-badge diet-badge-default">
        {diet}
      </span>
    );
  };

  // Helper to format custom prices
  const formatPrice = (price) => {
    if (!price || price === studentPrice) return null;
    if (price.includes('/')) {
      const parts = price.split('/').map(p => p.trim());
      const customStudent = parts[0];
      if (customStudent && !customStudent.includes('3,10')) {
        return customStudent.includes('€') ? customStudent : `${customStudent} €`;
      }
      return null;
    }
    return price;
  };

  return (
    <div className="glass-card restaurant-card">
      {/* Header */}
      <div className="restaurant-card-header">
        <div className="restaurant-title-box">
          <div className="restaurant-name">
            {name}
          </div>
          <div className="restaurant-campus-line">
            <MapPin size={12} color="var(--primary)" />
            <span>{building || campusName}</span>
            <span className="restaurant-operator-badge">{operator}</span>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          className={`fav-btn ${isFavorite ? 'is-fav' : ''}`}
          onClick={() => onToggleFavorite(id)}
          title={isFavorite ? 'Poista suosikeista' : 'Lisää suosikiksi'}
        >
          <Heart size={16} fill={isFavorite ? '#f43f5e' : 'none'} color={isFavorite ? '#f43f5e' : 'currentColor'} />
        </button>
      </div>

      {/* Status & Price Row */}
      <div className="card-status-bar">
        <div className="status-pill">
          <span className={`status-dot status-dot-${openStatus?.badgeColor || 'emerald'}`} />
          <span>{openStatus?.statusText || (openHours?.lunch ? `Lounas ${openHours.lunch}` : 'Avoinna')}</span>
        </div>

        <div className="student-price-pill" title="Kelan ateriatuettu opiskelijahinta">
          <span>Opiskelija {studentPrice}</span>
        </div>
      </div>

      {/* Meal Packages */}
      <div className="menu-packages-list">
        {hasMenu ? (
          packages.map((pkg, idx) => {
            const rawTitle = pkg.rawTitle;
            const upperTitle = rawTitle.toUpperCase();
            const isCategory = CATEGORY_NAMES.some(cat => upperTitle.includes(cat)) || /^LOUNAS\s*\d*$/i.test(rawTitle);
            const meals = pkg.meals || [];
            const displayPrice = formatPrice(pkg.price);

            const firstMealName = (meals[0]?.name || '').trim();
            const isTitleSameAsFirstMeal = firstMealName && (rawTitle.toLowerCase() === firstMealName.toLowerCase());

            // Primary dish
            const mainDish = meals[0];
            // Second key item (e.g. side dish or protein)
            const secondDish = meals.length === 2 ? meals[1] : (meals.length > 2 ? meals[1] : null);
            // Remaining garnishes / salad bar components (3rd item onwards)
            const remainingGarnishes = meals.length > 2 ? meals.slice(2) : [];

            return (
              <div key={pkg.id || idx} className="menu-package-item">
                {/* Category Header or Custom Title */}
                {(isCategory || (!isTitleSameAsFirstMeal && rawTitle && meals.length > 1)) && (
                  <div className="menu-pkg-header">
                    <span className="menu-cat-tag">{rawTitle}</span>
                    {displayPrice && (
                      <span className="menu-pkg-price">{displayPrice}</span>
                    )}
                  </div>
                )}

                {/* Main Dish */}
                {mainDish ? (
                  <>
                    <div className="menu-dish-row">
                      <span className="menu-dish-name">{mainDish.name}</span>
                      {mainDish.diets && mainDish.diets.length > 0 && (
                        <div className="menu-diets-wrap">
                          {mainDish.diets.map(d => renderDietBadge(d, `${idx}-main`))}
                        </div>
                      )}
                    </div>

                    {/* Second key item */}
                    {secondDish && (
                      <div className="menu-dish-sub">
                        <span className="menu-dish-sub-name">
                          <span className="sub-dish-bullet">+ </span>
                          {secondDish.name}
                        </span>
                        {secondDish.diets && secondDish.diets.length > 0 && (
                          <div className="menu-diets-wrap">
                            {secondDish.diets.map(d => renderDietBadge(d, `${idx}-sub`))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Consolidated Garnishes / Salad Ingredients (Single clean inline line instead of 10 rows!) */}
                    {remainingGarnishes.length > 0 && (
                      <div className="menu-garnishes-inline">
                        <span className="garnishes-label">Lisukkeet & salaatit: </span>
                        <span>{remainingGarnishes.map(g => g.name).join(', ')}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="menu-dish-row">
                    <span className="menu-dish-name">{rawTitle}</span>
                    {pkg.diets && pkg.diets.length > 0 && (
                      <div className="menu-diets-wrap">
                        {pkg.diets.map(d => renderDietBadge(d, `${idx}`))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-menu-box">
            <AlertCircle size={18} color="var(--text-muted)" />
            <span>Ei ruokalistaa tälle päivälle</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="restaurant-card-footer">
        <button
          className="btn btn-ghost"
          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
          onClick={() => onOpenDetails(restaurant)}
        >
          <Info size={12} />
          <span>Tiedot & Viikko</span>
        </button>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              title="Avaa reittiohjeet Google Mapsissa"
            >
              <MapPin size={12} />
              <span>Kartta</span>
            </a>
          )}

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              title="Ravintolan virallinen verkkosivu"
            >
              <ExternalLink size={12} />
              <span>Verkkosivu</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
