import React from 'react';
import { Store, Clock, Leaf, BadgePercent } from 'lucide-react';

export default function StatsBar({ restaurants, allRestaurantsCount }) {
  const openCount = restaurants.filter(r => r.openStatus?.isOpen).length;
  
  // Count vegan/vegetarian packages
  const vegCount = restaurants.reduce((acc, r) => {
    const pkgs = r.menu?.packages || [];
    const count = pkgs.filter(p => p.isVegan || p.isVegetarian).length;
    return acc + count;
  }, 0);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon-wrap stat-icon-cyan">
          <Store size={20} />
        </div>
        <div>
          <div className="stat-val">{restaurants.length} / {allRestaurantsCount}</div>
          <div className="stat-lbl">Ravintolaa listalla</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap stat-icon-emerald">
          <Clock size={20} />
        </div>
        <div>
          <div className="stat-val">{openCount}</div>
          <div className="stat-lbl">Avoinna juuri nyt</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap stat-icon-purple">
          <Leaf size={20} />
        </div>
        <div>
          <div className="stat-val">{vegCount}</div>
          <div className="stat-lbl">Kasvis- & vegaaniruokaa</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap stat-icon-amber">
          <BadgePercent size={20} />
        </div>
        <div>
          <div className="stat-val">3,10 €</div>
          <div className="stat-lbl">Kelan ateriatuki / opiskelija</div>
        </div>
      </div>
    </div>
  );
}
