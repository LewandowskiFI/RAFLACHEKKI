import React from 'react';
import { Utensils, Sparkles, Heart, Sun, Moon, RefreshCw, Dices } from 'lucide-react';

export default function Header({
  theme,
  setTheme,
  onlyFavorites,
  setOnlyFavorites,
  favoritesCount,
  onOpenRoulette,
  onRefresh,
  loading
}) {
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('raflachekki_theme', nextTheme);
  };

  return (
    <header className="header-glass">
      <div className="header-inner">
        {/* Brand */}
        <div className="logo-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-icon-box">
            <Utensils size={24} />
          </div>
          <div className="logo-title-wrap">
            <div className="logo-title">
              RAFLACHEKKI
              <Sparkles size={16} color="#34d399" />
            </div>
            <span className="logo-subtitle">Jyväskylän opiskelijaravintolat</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Lounasarpa Button */}
          <button 
            className="btn btn-roulette"
            onClick={onOpenRoulette}
            title="Arvo satunnainen lounas päivän tarjonnasta"
          >
            <Dices size={18} />
            <span className="hide-on-mobile">Lounasarpa 🎲</span>
          </button>

          {/* Favorites Filter */}
          <button
            className={`btn btn-ghost ${onlyFavorites ? 'btn-active-fav' : ''}`}
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            title="Näytä vain suosikkiravintolat"
          >
            <Heart size={18} fill={onlyFavorites ? '#f43f5e' : 'none'} color={onlyFavorites ? '#f43f5e' : 'currentColor'} />
            <span className="hide-on-mobile">Suosikit</span>
            {favoritesCount > 0 && (
              <span style={{
                fontSize: '0.72rem',
                background: '#f43f5e',
                color: '#fff',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontWeight: 700
              }}>
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Refresh Button */}
          <button
            className="btn btn-ghost btn-icon-only"
            onClick={onRefresh}
            title="Päivitä ruokalistat"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning-icon' : ''} />
          </button>

          {/* Theme Switcher */}
          <button
            className="btn btn-ghost btn-icon-only"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Vaihda vaaleaan teemaan' : 'Vaihda tummaan teemaan'}
          >
            {theme === 'dark' ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} color="#6366f1" />}
          </button>
        </div>
      </div>
    </header>
  );
}
