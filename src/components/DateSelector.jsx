import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS_FI = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'];

export default function DateSelector({ selectedDate, onSelectDate }) {
  // Generate days for the current week (Monday to Friday)
  const getWeekDays = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
    
    // Distance from Monday (1)
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const isToday = d.toDateString() === today.toDateString();
      const dayName = WEEKDAYS_FI[d.getDay()];
      const displayDate = `${d.getDate()}.${d.getMonth() + 1}.`;

      days.push({
        dateStr,
        dayName,
        displayDate,
        isToday,
        fullDayName: ['Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai'][i]
      });
    }

    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="date-selector-bar">
      {weekDays.map(item => {
        const isSelected = selectedDate === item.dateStr;
        return (
          <button
            key={item.dateStr}
            className={`date-pill ${isSelected ? 'active' : ''}`}
            onClick={() => onSelectDate(item.dateStr)}
          >
            <span className="date-pill-day">
              {item.isToday ? 'Tänään' : item.dayName}
            </span>
            <span className="date-pill-date">
              {item.displayDate}
            </span>
          </button>
        );
      })}
    </div>
  );
}
