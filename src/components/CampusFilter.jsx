import React from 'react';
import { Sparkles, Landmark, Waves, Mountain, GraduationCap, Trees } from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Landmark,
  Waves,
  Mountain,
  GraduationCap,
  Trees
};

export default function CampusFilter({
  campuses,
  selectedCampus,
  onSelectCampus,
  restaurantCounts
}) {
  return (
    <div className="campus-tabs">
      {campuses.map(campus => {
        const IconComponent = ICON_MAP[campus.icon] || Sparkles;
        const isActive = selectedCampus === campus.id;
        const count = restaurantCounts[campus.id] || 0;

        return (
          <button
            key={campus.id}
            className={`campus-tab ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCampus(campus.id)}
          >
            <IconComponent size={16} />
            <span>{campus.name}</span>
            {count > 0 && (
              <span className="campus-tab-count">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
