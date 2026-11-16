import React, { useState, useEffect } from 'react';
import WeekSection from './WeekSection';
import ConfirmModal from './ConfirmModal';
import CancelModal from '../mis-reservas/CancelModal';
import { isPast, formatLongDate, parseDate } from '../../utils/dateUtils';

const MENU_LABELS = {
  vegetariano: 'Vegetariano',
  hipocalorico: 'Hipocalórico',
};

export default function ReservaView({
  weeks,
  dragState,
  activeDragIds,
  onToggleMenu,
  onToggleExpand,
  onChangeTab,
  onWeekAction,
  onClearSelection,
  onConfirmReservations,
  onDragStart,
  onDragEnter,
  reservations = [],
  totalAlmuerzos = 0,
  onCancelReservation,
}) {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [pendingCancel, setPendingCancel] = useState(null);

  useEffect(() => {
    const todayCard = document.querySelector('.badge-today')?.closest('.day-card');
    if (todayCard) {
      todayCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  const newItems = [];
  const changeItems = [];

  weeks.forEach((w) => {
    w.days.forEach((d) => {
      if (isPast(d.dateStr)) return;
      if (!d.special) return;
      if (d.reserved && d.special !== d.reserved) {
        changeItems.push(d);
      } else if (!d.reserved) {
        newItems.push(d);
      }
    });
  });

  const total = newItems.length + changeItems.length;

  const handleOpenConfirm = () => {
    if (total > 0) setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (!isSubmitting) setIsConfirmOpen(false);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirmReservations(newItems, changeItems);
    setIsSubmitting(false);
    setIsConfirmOpen(false);
  };

  const handleOpenCancel = (resId, dayId) => {
    setPendingCancel({ resId, dayId });
  };

  const handleCloseCancel = () => {
    setPendingCancel(null);
  };

  const handleConfirmCancel = () => {
    if (pendingCancel && onCancelReservation) {
      onCancelReservation(pendingCancel.resId, pendingCancel.dayId);
    }
    setPendingCancel(null);
  };

  const pendingDays = [...newItems, ...changeItems];
  const pendingDayIds = new Set(pendingDays.map((day) => day.id));
  const reservationsByDay = new Map(reservations.map((r) => [r.dayId, r]));
  const reservationRows = [
    ...pendingDays.map((day) => {
      const existing = reservationsByDay.get(day.id);
      return {
        id: existing?.id || `pending-${day.id}`,
        dayId: day.id,
        fechaDesde: day.dateStr,
        fechaHasta: day.dateStr,
        menu: MENU_LABELS[day.special],
        codigo: existing?.codigo || '',
        status: day.reserved ? 'Cambio pendiente' : 'Pendiente',
        pendingDay: day,
      };
    }),
    ...reservations
      .filter((r) => !pendingDayIds.has(r.dayId))
      .map((r) => ({ ...r, status: 'Confirmada' })),
  ].sort((a, b) => parseDate(a.fechaDesde) - parseDate(b.fechaDesde));

  const query = filterText.trim().toLowerCase();
  const filteredRows = reservationRows.filter((r) =>
    [r.codigo, r.menu, r.fechaDesde, r.fechaHasta, formatLongDate(r.fechaDesde), r.status]
      .some((value) => value.toLowerCase().includes(query))
  );

  const currentWeek = weeks[selectedWeekIndex] || weeks[0];

  return (
    <section id="view-reserva" className="view active" aria-labelledby="h-reserva">
      <header className="page-head">
        <h1 id="h-reserva">Reserva de menú</h1>
        <p className="campus">Casa Central Valparaíso</p>
        <p className="lede">
          Elige tus días de menú vegetariano o hipocalórico consultando el
          detalle de platos y macronutrientes. Selecciona un menú especial para
          reservarlo; vuelve a presionar para retornar al general. Usa las flechas
          para alternar entre la semana actual y la próxima semana.
        </p>
      </header>

      <div className="unified-reserva-layout">
        {/* Columna Izquierda: Reserva de Menú y Carrusel */}
        <div className="unified-left-col">
          <div className="legend" role="note" aria-label="Leyenda de estados">
            <span className="legend-item">
              <i className="dot dot-general" aria-hidden="true"></i>Menú general
            </span>
            <span className="legend-item">
              <i className="dot dot-veg" aria-hidden="true"></i>Vegetariano
            </span>
            <span className="legend-item">
              <i className="dot dot-hipo" aria-hidden="true"></i>Hipocalórico
            </span>
            <span className="legend-item">
              <i className="dot dot-past" aria-hidden="true"></i>Día no disponible
            </span>
          </div>

          <main id="calendar" aria-live="polite">
            {currentWeek && (
              <WeekSection
                key={currentWeek.label}
                week={currentWeek}
                dragState={dragState}
                activeDragIds={activeDragIds}
                onToggleMenu={onToggleMenu}
                onToggleExpand={onToggleExpand}
                onChangeTab={onChangeTab}
                onWeekAction={onWeekAction}
                onDragStart={onDragStart}
                onDragEnter={onDragEnter}
                onPrevWeek={() => setSelectedWeekIndex((prev) => Math.max(0, prev - 1))}
                onNextWeek={() => setSelectedWeekIndex((prev) => Math.min(weeks.length - 1, prev + 1))}
                hasPrevWeek={selectedWeekIndex > 0}
                hasNextWeek={selectedWeekIndex < weeks.length - 1}
              />
            )}
          </main>
        </div>

        {/* Columna Derecha: Reservas y Botón de Alta Jerarquía */}
        <div className="unified-right-col" id="panel-mis-reservas">
          <div className="reservas-panel-box">
            {/* Header con Título y Botón Hero */}
            <div className="reservas-panel-header">
              <div className="reservas-panel-title-area">
                <h2 id="reservas-panel-title">Reservas</h2>
                <span className="reservas-active-badge">
                  {reservations.length} {reservations.length === 1 ? 'activa' : 'activas'}
                </span>
              </div>

              <button
                type="button"
                id="btnHeroConfirm"
                className={`btn-confirm-hero ${total > 0 ? 'has-pending' : ''}`}
                disabled={total === 0}
                onClick={handleOpenConfirm}
                aria-label={`Confirmar ${total} reserva${total !== 1 ? 's' : ''}`}
              >
                <span className="btn-confirm-icon">✓</span>
                <span className="btn-confirm-text">
                  {total > 0 ? `Confirmar Reservas (${total})` : 'Confirmar Reservas'}
                </span>
              </button>
            </div>

            {/* Barra de búsqueda de reservas */}
            <div className="reservas-table-toolbar">
              <input
                type="search"
                className="form-input search-input-sm"
                aria-label="Buscar reservas por código, fecha, menú o estado"
                placeholder="Buscar reserva por código, fecha o menú…"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
              <button
                type="button"
                className="btn-clear-pending"
                disabled={total === 0}
                onClick={onClearSelection}
                aria-label="Descartar todas las selecciones pendientes"
                title="Descartar todas las selecciones pendientes"
              >
                Descartar
              </button>
            </div>

            {/* Tabla compacta de reservas */}
            <div
              className="reservas-table-container"
              role="region"
              aria-labelledby="reservas-panel-title"
              tabIndex={0}
            >
              <table className="data-table compact-table">
                <thead>
                  <tr>
                    <th>Acción</th>
                    <th>Fecha</th>
                    <th>Menú</th>
                    <th>Estado / código</th>
                  </tr>
                </thead>
                <tbody>
                  {reservationRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-row" style={{ padding: '28px 14px' }}>
                        <div className="empty-state">
                          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                            Aún no tienes reservas.
                          </p>
                          <small style={{ color: 'var(--ink-soft)', marginTop: 6, fontSize: '0.88rem' }}>
                            Selecciona tus menús en el calendario y presiona &quot;Confirmar Reservas&quot;.
                          </small>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-row" style={{ padding: '20px' }}>
                        No hay reservas que coincidan con &quot;{filterText}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((r) => (
                      <tr
                        key={r.id}
                        className={r.pendingDay ? 'reserva-row-pending' : undefined}
                        data-day-id={r.dayId}
                        data-state={r.pendingDay ? 'pending' : 'confirmed'}
                      >
                        <td>
                          <button
                            type="button"
                            className="btn-cancel"
                            data-id={r.id}
                            data-day-id={r.dayId}
                            onClick={() => {
                              if (r.pendingDay) {
                                onToggleMenu(r.dayId, r.pendingDay.reserved || r.pendingDay.special);
                              } else {
                                handleOpenCancel(r.id, r.dayId);
                              }
                            }}
                            aria-label={`${r.pendingDay ? 'Descartar selección' : 'Anular reserva'} del ${formatLongDate(r.fechaDesde)}`}
                            title={r.pendingDay ? 'Descartar esta selección pendiente' : 'Anular esta reserva'}
                          >
                            {r.pendingDay ? 'Quitar' : 'Anular'}
                          </button>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{formatLongDate(r.fechaDesde)}</span>
                        </td>
                        <td>
                          <span
                            className={`badge-menu ${
                              r.menu.toLowerCase().includes('veg') ? 'veg' : 'hipo'
                            }`}
                          >
                            {r.menu.toLowerCase().includes('veg')
                              ? '🌱 Vegetariano'
                              : '🥗 Hipocalórico'}
                          </span>
                          {r.pendingDay?.reserved && (
                            <small className="reserva-previous-menu">
                              Antes: {MENU_LABELS[r.pendingDay.reserved]}
                            </small>
                          )}
                        </td>
                        <td>
                          <div className="reserva-state-code">
                            <span className={`reserva-status ${r.pendingDay ? 'is-pending' : 'is-confirmed'}`}>
                              {r.status}
                            </span>
                            {!r.pendingDay && (
                              <code className="reserva-code-tag">{r.codigo}</code>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Información importante siempre visible */}
            <section className="reservas-info" aria-labelledby="reservas-info-title">
              <h3 id="reservas-info-title">ℹ️ Plazo de anulación y horarios</h3>
              <div className="info-content">
                <p>
                  El plazo para anular una reserva es hasta las <strong>16:00 horas</strong> del día anterior a su consumo.
                </p>
                <p>
                  Comedor Central • Campus Casa Central Valparaíso.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        items={{ newItems, changeItems }}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
      />

      <CancelModal
        isOpen={Boolean(pendingCancel)}
        onClose={handleCloseCancel}
        onConfirm={handleConfirmCancel}
      />
    </section>
  );
}
