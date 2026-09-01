import React, { useState } from 'react';
import { Heart, MapPin, ExternalLink, Info, Sparkles, AlertCircle } from 'lucide-react';

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
    address,
    operator,
    studentPrice,
    openHours,
    openStatus,
    menu,
    mapsUrl,
    website
  } = restaurant;

  const packages = menu?.packages || [];
  const hasMenu = menu?.success && packages.length > 0;

  // Render diet badge with appropriate color
  const renderDietBadge = (diet) => {
    const d = diet.toUpperCase();
    if (['VEG', 'VEGAN', 'KASVIS'].includes(d)) {
      return <span key={diet} className="diet-badge diet-badge-veg">VEG</span>;
    }
    if (['G', 'GL'].includes(d)) {
      return <span key={diet} className="diet-badge diet-badge-g">G</span>;
    }
    if (['L'].includes(d)) {
      return <span key={diet} className="diet-badge diet-badge-l">L</span>;
    }
    if (['M', 'MAIDOTON'].includes(d)) {
      return <span key={diet} className="diet-badge diet-badge-m">M</span>;
    }
    if (['ILM', 'ILMASTO'].includes(d)) {
      return <span key={diet} className="diet-badge diet-badge-ilm">ILMASTO</span>;
    }
    if (['*', 'SYD', 'SYDÄNMERKKI'].includes(d)) {
      return <span key={diet} className="diet-badge diet-badge-syd">❤️ SYDÄN</span>;
    }
    return <span key={diet} className="diet-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>{diet}</span>;
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
            <MapPin size={13} color="var(--primary)" />
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
          <Heart size={18} fill={isFavorite ? '#f43f5e' : 'none'} color={isFavorite ? '#f43f5e' : 'currentColor'} />
        </button>
      </div>

      {/* Status & Price Row */}
      <div className="card-status-bar">
        <div className="status-pill">
          <span className={`status-dot status-dot-${openStatus?.badgeColor || 'gray'}`} />
          <span>{openStatus?.statusText || (openHours?.lunch ? `Lounas ${openHours.lunch}` : 'Suljettu')}</span>
        </div>

        <div className="student-price-pill" title="Kelan ateriatuettu opiskelijahinta">
          <span>Opiskelija {studentPrice}</span>
        </div>
      </div>

      {/* Meal Packages */}
      <div className="menu-packages-list">
        {hasMenu ? (
          packages.map((pkg, idx) => (
            <div key={pkg.id || idx} className="menu-package-item">
              <div className="menu-pkg-header">
                <span className="menu-pkg-title">{pkg.title}</span>
                {pkg.price && pkg.price !== studentPrice && (
                  <span className="menu-pkg-price">{pkg.price}</span>
                )}
              </div>

              {pkg.meals && pkg.meals.map((meal, mIdx) => (
                <div key={mIdx} className="menu-meal-dish">
                  <span>{meal.name}</span>
                  {meal.diets && meal.diets.map(d => renderDietBadge(d))}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="no-menu-box">
            <AlertCircle size={24} color="var(--text-muted)" />
            <span>Ei ruokalistaa saatavilla tälle päivälle</span>
            <span style={{ fontSize: '0.75rem' }}>Ravintola saattaa olla suljettuna tai lista päivittyy pian</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="restaurant-card-footer">
        <button
          className="btn btn-ghost"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          onClick={() => onOpenDetails(restaurant)}
        >
          <Info size={14} />
          <span>Tiedot & Viikko</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              title="Avaa reittiohjeet Google Mapsissa"
            >
              <MapPin size={14} />
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
              <ExternalLink size={14} />
              <span>Verkkosivu</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
