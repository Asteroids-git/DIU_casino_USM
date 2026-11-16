import React from 'react';
import DayCard from './DayCard';

export default function WeekSection({
  week,
  dragState,
  activeDragIds,
  onToggleMenu,
  onToggleExpand,
  onChangeTab,
  onWeekAction,
  onDragStart,
  onDragEnter,
  onPrevWeek,
  onNextWeek,
  hasPrevWeek,
  hasNextWeek,
}) {
  return (
    <section className="week">
      <div className="week-head">
        <div className="week-title-nav-group">
          <div className="week-title-text">
            <h2>{week.label}</h2>
            <span className="week-range">{week.range}</span>
          </div>

          <div className="week-switch-arrows" role="group" aria-label="Navegación entre semanas">
            <button
              type="button"
              className="btn-week-arrow prev"
              onClick={onPrevWeek}
              disabled={!hasPrevWeek}
              aria-label="Ver semana anterior"
              title={hasPrevWeek ? 'Ver semana anterior' : 'Estás en la primera semana'}
            >
              ‹
            </button>
            <button
              type="button"
              className="btn-week-arrow next"
              onClick={onNextWeek}
              disabled={!hasNextWeek}
              aria-label="Ver semana siguiente"
              title={hasNextWeek ? 'Ver semana siguiente' : 'Estás en la última semana disponible'}
            >
              ›
            </button>
          </div>
        </div>

        <div className="week-actions">
          <button
            type="button"
            className="week-quick"
            title="Marcar toda la semana como vegetariano"
            onClick={() => onWeekAction('all-veg', week.label)}
          >
            Toda veg
          </button>
          <button
            type="button"
            className="week-quick"
            title="Marcar toda la semana como hipocalórico"
            onClick={() => onWeekAction('all-hipo', week.label)}
          >
            Toda hipo
          </button>
          <button
            type="button"
            className="week-quick"
            title="Limpiar selección pendiente de esta semana"
            onClick={() => onWeekAction('clear', week.label)}
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="week-days-grid">
        {week.days.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            isDragInRange={activeDragIds?.includes(day.id)}
            isDragEndpoint={
              dragState?.isDragging &&
              (day.id === dragState.startId || day.id === dragState.currentId)
            }
            onToggleMenu={onToggleMenu}
            onToggleExpand={onToggleExpand}
            onChangeTab={onChangeTab}
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
          />
        ))}
      </div>
    </section>
  );
}
