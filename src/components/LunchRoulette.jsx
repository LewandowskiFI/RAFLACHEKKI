import React, { useState } from 'react';
import { X, Dices, Sparkles, MapPin, CheckCircle2, RefreshCw } from 'lucide-react';

export default function LunchRoulette({
  isOpen,
  onClose,
  restaurants,
  campuses
}) {
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedDiet, setSelectedDiet] = useState('all');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [spinText, setSpinText] = useState('Valitse asetukset ja pyöräytä arpaa!');

  if (!isOpen) return null;

  // Flatten all available meals
  const getEligibleMeals = () => {
    let pool = restaurants;
    if (selectedCampus !== 'all') {
      pool = pool.filter(r => r.campus === selectedCampus);
    }

    const mealsList = [];
    for (const r of pool) {
      const packages = r.menu?.packages || [];
      for (const pkg of packages) {
        if (selectedDiet === 'Veg' && !pkg.isVegan && !pkg.isVegetarian) continue;
        if (selectedDiet === 'G' && !pkg.isGlutenFree) continue;
        if (selectedDiet === 'L' && !pkg.isLactoseFree) continue;

        mealsList.push({
          restaurantName: r.name,
          campusName: r.campusName,
          building: r.building,
          studentPrice: r.studentPrice,
          mapsUrl: r.mapsUrl,
          package: pkg
        });
      }
    }
    return mealsList;
  };

  const handleSpin = () => {
    const eligible = getEligibleMeals();
    if (eligible.length === 0) {
      setSpinResult(null);
      setSpinText('Ei löytynyt lounaita valituilla kriteereillä. Kokeile vaihtaa kampusta tai ruokavaliota!');
      return;
    }

    setIsSpinning(true);
    setSpinResult(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randomCandidate = eligible[Math.floor(Math.random() * eligible.length)];
      setSpinText(`${randomCandidate.restaurantName}: ${randomCandidate.package.title}`);
      counter++;

      if (counter > 15) {
        clearInterval(interval);
        const finalWinner = eligible[Math.floor(Math.random() * eligible.length)];
        setSpinResult(finalWinner);
        setIsSpinning(false);
      }
    }, 90);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="roulette-box">
          <div style={{ display: 'inline-flex', padding: '0.6rem', borderRadius: '50%', background: 'rgba(217, 70, 239, 0.15)', color: '#d946ef', marginBottom: '0.5rem' }}>
            <Dices size={32} />
          </div>

          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Lounasarpa 🎲</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Etkö osaa päättää mitä söisit? Anna arvan valita päivän paras lounas!
          </p>

          {/* Preferences */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {/* Campus dropdown */}
            <select
              value={selectedCampus}
              onChange={e => setSelectedCampus(e.target.value)}
              className="search-input"
              style={{ width: 'auto', padding: '0.45rem 1rem' }}
            >
              <option value="all">Kaikki kampukset</option>
              {campuses.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Diet dropdown */}
            <select
              value={selectedDiet}
              onChange={e => setSelectedDiet(e.target.value)}
              className="search-input"
              style={{ width: 'auto', padding: '0.45rem 1rem' }}
            >
              <option value="all">Kaikki ruokavaliot</option>
              <option value="Veg">🌿 Vain Kasvis / Vegaani</option>
              <option value="G">🌾 Vain Gluteeniton</option>
              <option value="L">🥛 Vain Laktoositon</option>
            </select>
          </div>

          {/* Slot display */}
          <div className={`roulette-spinner ${isSpinning ? 'roulette-spinning' : ''} ${spinResult ? 'winner-card' : ''}`}>
            {spinResult ? (
              <div style={{ animation: 'popIn 0.3s ease' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#d946ef', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <Sparkles size={16} /> PÄIVÄN VOITTAJA <Sparkles size={16} />
                </div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {spinResult.restaurantName}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                  📍 {spinResult.building || spinResult.campusName} • Opiskelijahinta {spinResult.studentPrice}
                </div>

                <div style={{ background: 'var(--surface-muted)', padding: '0.85rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid var(--surface-card-border)' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>
                    {spinResult.package.title}
                  </div>
                  {spinResult.package.meals?.map((m, idx) => (
                    <div key={idx} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      {m.name}
                    </div>
                  ))}
                </div>

                {spinResult.mapsUrl && (
                  <a
                    href={spinResult.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                  >
                    <MapPin size={15} />
                    <span>Avaa reittiohjeet</span>
                  </a>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '1rem' }}>
                {spinText}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            className="btn btn-roulette"
            onClick={handleSpin}
            disabled={isSpinning}
            style={{ width: '100%', padding: '0.8rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
          >
            {isSpinning ? (
              <>
                <RefreshCw size={20} className="spinning-icon" />
                <span>Arvotaan lounasta...</span>
              </>
            ) : (
              <>
                <Dices size={20} />
                <span>{spinResult ? 'Arvo toinen vaihtoehto 🎲' : 'Pyöräytä lounasarpa! 🎲'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
