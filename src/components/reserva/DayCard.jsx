import React, { useRef } from 'react';
import { isPast, isToday } from '../../utils/dateUtils';
import DayDetail from './DayDetail';

function getDayStatusText(day) {
  if (isPast(day.dateStr)) return 'Este día ya pasó';

  const labels = { vegetariano: 'vegetariano', hipocalorico: 'hipocalórico' };

  if (day.reserved && day.special && day.special !== day.reserved) {
    return `Cambio pendiente a ${labels[day.special]}`;
  }
  if (day.reserved) {
    return `Reservado — menú ${labels[day.reserved]}`;
  }
  if (day.special) {
    return `Pendiente — menú ${labels[day.special]}`;
  }
  return 'Menú general (por defecto)';
}

export default function DayCard({
  day,
  onToggleMenu,
  onToggleExpand,
  onChangeTab,
}) {
  const cardRef = useRef(null);
  const expandButtonRef = useRef(null);
  const past = isPast(day.dateStr);
  const today = isToday(day.dateStr);
  const hasPendingChange =
    day.reserved && day.special && day.special !== day.reserved;

  let stateClasses = [];
  if (past) {
    stateClasses.push('is-past');
  } else if (day.reserved) {
    stateClasses.push(
      'is-reserved-' + (day.reserved === 'vegetariano' ? 'veg' : 'hipo')
    );
  } else if (day.special) {
    stateClasses.push('is-' + day.special);
  }

  if (hasPendingChange) {
    stateClasses.push('has-pending');
  }

  const activeType = day.special || day.reserved;
  const pendingVeg =
    day.special === 'vegetariano' &&
    day.reserved &&
    day.reserved !== 'vegetariano';
  const pendingHipo =
    day.special === 'hipocalorico' &&
    day.reserved &&
    day.reserved !== 'hipocalorico';

  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      onToggleExpand(day.id);
      return;
    }
    if (past) return;
    if (e.key === 'v' || e.key === 'V') {
      e.preventDefault();
      onToggleMenu(day.id, 'vegetariano');
      cardRef.current?.focus();
    } else if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      onToggleMenu(day.id, 'hipocalorico');
      cardRef.current?.focus();
    }
  };

  return (
    <article
      ref={cardRef}
      className={`day-card ${stateClasses.join(' ')}`}
      data-day-id={day.id}
      tabIndex={0}
      aria-label={`${day.name} ${day.num} — ${getDayStatusText(day)}`}
      onKeyDown={handleKeyDown}
    >
      <div className="day-top">
        <div className="day-date">
          <span className="day-name">{day.name}</span>
          <span className="day-num">{day.num}</span>
        </div>
        {today && <span className="badge badge-today">Hoy</span>}
        {past && <span className="badge badge-past">Pasado</span>}
      </div>

      <div
        className="day-menus"
        aria-label={`Menús disponibles para ${day.name} ${day.num}`}
      >
        <div className="day-menu-row general">
          <span className="day-menu-label">General</span>
          <span className="day-menu-dish">{day.menu.fondo}</span>
        </div>

        <div className="day-menu-row vegetarian">
          <span className="day-menu-label">Veg 🌱</span>
          <span className="day-menu-dish">{day.menu.vegetariano}</span>
        </div>

        <div className="day-menu-row hipocaloric">
          <span className="day-menu-label">Hipo 🥗</span>
          <span className="day-menu-dish">{day.menu.hipocalorico}</span>
        </div>
      </div>

      <div className="day-card-footer">
        {!past ? (
          <div className="day-actions">
            <button
              type="button"
              className={`toggle toggle-veg ${
                activeType === 'vegetariano' ? 'active' : ''
              } ${pendingVeg ? 'pending' : ''}`}
              aria-pressed={activeType === 'vegetariano'}
              aria-label={`Seleccionar menú vegetariano el ${day.name} ${day.num}`}
              onClick={() => onToggleMenu(day.id, 'vegetariano')}
            >
              <span className="toggle-icon">🌱</span>
              <span className="toggle-text">Vegetariano</span>
            </button>
            <button
              type="button"
              className={`toggle toggle-hipo ${
                activeType === 'hipocalorico' ? 'active' : ''
              } ${pendingHipo ? 'pending' : ''}`}
              aria-pressed={activeType === 'hipocalorico'}
              aria-label={`Seleccionar menú hipocalórico el ${day.name} ${day.num}`}
              onClick={() => onToggleMenu(day.id, 'hipocalorico')}
            >
              <span className="toggle-icon">🥗</span>
              <span className="toggle-text">Hipocalórico</span>
            </button>
          </div>
        ) : (
          <div className="day-actions-placeholder" aria-hidden="true"></div>
        )}

        <p className="day-status">{getDayStatusText(day)}</p>

        <button
          ref={expandButtonRef}
          type="button"
          className="expand-btn"
          aria-expanded={day.expanded}
          aria-controls={day.expanded ? `day-detail-${day.id}` : undefined}
          onClick={() => onToggleExpand(day.id)}
        >
          <span>{day.expanded ? 'Ocultar minuta y nutrición' : 'Ver minuta y nutrición'}</span>
          <svg
            className="chev"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {day.expanded && (
        <DayDetail
          day={day}
          onChangeTab={onChangeTab}
          anchorRef={expandButtonRef}
          onClose={() => onToggleExpand(day.id)}
        />
      )}
    </article>
  );
}
