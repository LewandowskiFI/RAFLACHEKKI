import React from 'react';
import { Search, X, Leaf, WheatOff, MilkOff, Droplets, Globe, Heart, Clock } from 'lucide-react';

const DIET_OPTIONS = [
  { id: 'Veg', label: 'Vegaaninen', icon: Leaf, class: 'active-veg' },
  { id: 'G', label: 'Gluteeniton', icon: WheatOff, class: 'active-g' },
  { id: 'L', label: 'Laktoositon', icon: MilkOff, class: 'active-l' },
  { id: 'M', label: 'Maidoton', icon: Droplets, class: 'active-l' },
  { id: 'ILM', label: 'Ilmastoystävällinen', icon: Globe, class: 'active-ilm' },
  { id: 'SYD', label: 'Sydänmerkki', icon: Heart, class: 'active-syd' }
];

export default function DietFilter({
  searchQuery,
  setSearchQuery,
  selectedDiets,
  onToggleDiet,
  onlyOpenNow,
  setOnlyOpenNow
}) {
  return (
    <div className="search-diet-row">
      {/* Search Bar */}
      <div className="search-input-wrap">
        <Search size={18} className="search-input-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Etsi annosta, esim. lohi, tofu, curry, pasta, keitto..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="search-clear-btn"
            onClick={() => setSearchQuery('')}
            title="Tyhjennä haku"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dietary Filters & Open Now Toggle */}
      <div className="diet-pills-wrap">
        {/* Open Now Toggle */}
        <button
          className={`diet-toggle-btn ${onlyOpenNow ? 'active-veg' : ''}`}
          onClick={() => setOnlyOpenNow(!onlyOpenNow)}
        >
          <Clock size={14} />
          <span>Avoinna nyt</span>
        </button>

        {/* Diets */}
        {DIET_OPTIONS.map(diet => {
          const IconComp = diet.icon;
          const isSelected = selectedDiets.includes(diet.id);

          return (
            <button
              key={diet.id}
              className={`diet-toggle-btn ${isSelected ? diet.class : ''}`}
              onClick={() => onToggleDiet(diet.id)}
            >
              <IconComp size={14} />
              <span>{diet.label}</span>
            </button>
          );
        })}

        {/* Clear all filters if active */}
        {(selectedDiets.length > 0 || searchQuery || onlyOpenNow) && (
          <button
            className="diet-toggle-btn"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => {
              setSearchQuery('');
              setOnlyOpenNow(false);
              selectedDiets.forEach(d => onToggleDiet(d));
            }}
          >
            <X size={14} />
            <span>Nollaa</span>
          </button>
        )}
      </div>
    </div>
  );
}
