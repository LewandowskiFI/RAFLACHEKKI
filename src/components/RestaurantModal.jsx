import React from 'react';
import { X, MapPin, Clock, ExternalLink, BadgePercent, CheckCircle, Info } from 'lucide-react';

export default function RestaurantModal({ restaurant, onClose }) {
  if (!restaurant) return null;

  const {
    name,
    campusName,
    building,
    address,
    operator,
    studentPrice,
    staffPrice,
    guestPrice,
    openHours,
    description,
    highlights,
    mapsUrl,
    website,
    menu
  } = restaurant;

  const packages = menu?.packages || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'var(--primary-glow)', color: '#34d399', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {operator} • {campusName}
          </div>
          <h2 style={{ fontSize: '1.6rem', lineHeight: 1.2, marginBottom: '0.35rem' }}>{name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            <MapPin size={15} color="var(--primary)" />
            <span>{building} ({address})</span>
          </div>
        </div>

        {/* Description & Highlights */}
        {description && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1rem', lineHeight: 1.5 }}>
            {description}
          </p>
        )}

        {highlights && highlights.length > 0 && (
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {highlights.map((h, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--surface-card-border)',
                  color: 'var(--text-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <CheckCircle size={12} color="#10b981" />
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Hours & Prices Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
          {/* Hours Card */}
          <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--surface-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              <Clock size={16} color="#06b6d4" />
              <span>Aukioloajat</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div><strong>Lounas:</strong> {openHours?.lunch || 'Katso lista'}</div>
              <div><strong>Ma–To:</strong> {openHours?.mon_thu || openHours?.mon_fri || 'Avoinna'}</div>
              <div><strong>Pe:</strong> {openHours?.fri || openHours?.mon_fri || 'Avoinna'}</div>
              <div><strong>Viikonloppu:</strong> {openHours?.sat_sun || 'Suljettu'}</div>
            </div>
          </div>

          {/* Prices Card */}
          <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--surface-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              <BadgePercent size={16} color="#10b981" />
              <span>Hinnasto</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ color: '#34d399', fontWeight: 700 }}><strong>Opiskelija:</strong> {studentPrice}</div>
              <div><strong>Jatko-opiskelija / HK:</strong> {staffPrice}</div>
              <div><strong>Vierailija:</strong> {guestPrice}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>*Sis. leivän, levitteen, salaatin & juoman</div>
            </div>
          </div>
        </div>

        {/* Today's Full Menu in Modal */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={18} color="var(--primary)" />
            <span>Päivän ruokalista ({restaurant.date})</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {packages.length > 0 ? (
              packages.map((pkg, idx) => (
                <div key={idx} style={{ background: 'var(--surface-muted)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--surface-card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    <span>{pkg.title}</span>
                    <span style={{ fontSize: '0.8rem', color: '#34d399' }}>{pkg.price || studentPrice}</span>
                  </div>
                  {pkg.meals?.map((m, mIdx) => (
                    <div key={mIdx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span>• {m.name}</span>
                      {m.diets?.map(d => (
                        <span key={d} className="diet-badge diet-badge-veg" style={{ fontSize: '0.65rem' }}>{d}</span>
                      ))}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                Ei ruokalistaa ladattuna tälle päivälle.
              </div>
            )}
          </div>
        </div>

        {/* Action links */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--surface-card-border)', paddingTop: '1rem' }}>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <MapPin size={15} />
              <span>Avaa kartalla</span>
            </a>
          )}

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ fontSize: '0.85rem' }}
            >
              <ExternalLink size={15} />
              <span>Virallinen verkkosivu</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
