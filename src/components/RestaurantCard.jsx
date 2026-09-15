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

  const packages = (menu && Array.isArray(menu.packages)) ? menu.packages : [];
  const hasMenu = packages.length > 0;

  // Render diet badge with clean compact pill
  const renderDietBadge = (diet, keyPrefix = '') => {
    const d = String(diet).trim().toUpperCase();
    if (['VEG', 'VEGAN', 'KASVIS'].includes(d)) {
      return <span key={`${keyPrefix}-veg-${diet}`} className="diet-badge diet-badge-veg" title="Vegaani / Kasvis">VEG</span>;
    }
    if (['G', 'GL'].includes(d)) {
      return <span key={`${keyPrefix}-g-${diet}`} className="diet-badge diet-badge-g" title="Gluteeniton">G</span>;
    }
    if (['L'].includes(d)) {
      return <span key={`${keyPrefix}-l-${diet}`} className="diet-badge diet-badge-l" title="Laktoositon">L</span>;
    }
    if (['M', 'MAIDOTON'].includes(d)) {
      return <span key={`${keyPrefix}-m-${diet}`} className="diet-badge diet-badge-m" title="Maidoton">M</span>;
    }
    if (['ILM', 'ILMASTO'].includes(d)) {
      return <span key={`${keyPrefix}-ilm-${diet}`} className="diet-badge diet-badge-ilm" title="Ilmastoystävällinen">🌱 ILM</span>;
    }
    if (['*', 'SYD', 'SYDÄN', 'SYDÄNMERKKI'].includes(d)) {
      return <span key={`${keyPrefix}-syd-${diet}`} className="diet-badge diet-badge-syd" title="Sydänmerkki">❤️</span>;
    }
    // Filter out internal code 'A' (Allergeeneja) from Finnish food systems
    if (d === 'A') return null;
    if (d === 'SIS.LUOMUA') {
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

  // Helper to format custom prices (avoid showing long 3,10 / 6,30 / 6,70 / 9,00 string)
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
            const rawTitle = (pkg.title || '').trim();
            const upperTitle = rawTitle.toUpperCase();
            const isCategory = CATEGORY_NAMES.some(cat => upperTitle.includes(cat)) || /^LOUNAS\s*\d*$/i.test(rawTitle);
            const meals = pkg.meals || [];
            const displayPrice = formatPrice(pkg.price);

            // If the package has meals and the title is just the first meal name, avoid duplicate title!
            const firstMealName = (meals[0]?.name || '').trim();
            const isTitleSameAsFirstMeal = firstMealName && (rawTitle.toLowerCase() === firstMealName.toLowerCase());

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

                {/* Primary & Secondary Dishes */}
                {meals.length > 0 ? (
                  meals.map((meal, mIdx) => {
                    const isMain = mIdx === 0;
                    return (
                      <div
                        key={mIdx}
                        className={isMain ? "menu-dish-row" : "menu-dish-sub"}
                      >
                        <span className={isMain ? "menu-dish-name" : "menu-dish-sub-name"}>
                          {!isMain && <span className="sub-dish-bullet">+ </span>}
                          {meal.name}
                        </span>

                        {meal.diets && meal.diets.length > 0 && (
                          <div className="menu-diets-wrap">
                            {meal.diets.map(d => renderDietBadge(d, `${idx}-${mIdx}`))}
                          </div>
                        )}
                      </div>
                    );
                  })
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
            <AlertCircle size={20} color="var(--text-muted)" />
            <span>Ei ruokalistaa tälle päivälle</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="restaurant-card-footer">
        <button
          className="btn btn-ghost"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
          onClick={() => onOpenDetails(restaurant)}
        >
          <Info size={13} />
          <span>Tiedot & Viikko</span>
        </button>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              title="Avaa reittiohjeet Google Mapsissa"
            >
              <MapPin size={13} />
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
              <ExternalLink size={13} />
              <span>Verkkosivu</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
