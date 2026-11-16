import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MAX_NUTRITION } from '../../data/initialData';

function pct(val, max) {
  return Math.max(6, Math.min(100, Math.round((val / max) * 100)));
}

function MacroRow({ label, value, max, hint }) {
  return (
    <div className="macro-row">
      <span className="macro-label" title={hint || ''}>
        {label}
      </span>
      <div className="bar" aria-hidden="true">
        <span style={{ width: `${pct(value, max)}%` }}></span>
      </div>
      <span className="macro-val">{value} g</span>
    </div>
  );
}

export default function DayDetail({ day, onChangeTab, anchorRef, onClose }) {
  const popoverRef = useRef(null);
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const currentTab = day.tab || 'general';
  const n = day.nutrition[currentTab];
  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'vegetariano', label: 'Vegetariano' },
    { key: 'hipocalorico', label: 'Hipocalórico' },
  ];

  useLayoutEffect(() => {
    const popover = popoverRef.current;
    const panel = panelRef.current;
    let animationFrame = 0;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const margin = 12;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      panel.style.width = `${Math.min(660, viewportWidth - margin * 2)}px`;
      panel.style.transform = 'none';
      const naturalBounds = panel.getBoundingClientRect();
      const scale = Math.min(1, (viewportHeight - margin * 2) / naturalBounds.height);
      const width = naturalBounds.width * scale;
      const height = naturalBounds.height * scale;
      const anchorBounds = anchor.getBoundingClientRect();
      const left = Math.max(margin, Math.min(
        anchorBounds.left + (anchorBounds.width - width) / 2,
        viewportWidth - margin - width,
      ));
      const top = Math.max(margin, Math.min(
        anchorBounds.top - height - 8,
        viewportHeight - margin - height,
      ));

      panel.style.transform = `scale(${scale})`;
      Object.assign(popover.style, {
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        visibility: 'visible',
      });
    };

    const schedulePosition = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    closeButtonRef.current.focus({ preventScroll: true });
    const observer = new ResizeObserver(schedulePosition);
    observer.observe(panel);
    window.addEventListener('resize', schedulePosition);
    window.addEventListener('scroll', schedulePosition, true);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', schedulePosition);
      window.removeEventListener('scroll', schedulePosition, true);
    };
  }, [anchorRef]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!popoverRef.current.contains(event.target) && !anchorRef.current?.contains(event.target)) {
        onClose();
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        anchorRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [anchorRef, onClose]);

  const handleTabKeyDown = (event, index) => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    onChangeTab(day.id, tabs[nextIndex].key);
    panelRef.current.querySelector(`#nutrition-tab-${day.id}-${tabs[nextIndex].key}`)
      .focus({ preventScroll: true });
  };

  return createPortal(
    <div
      ref={popoverRef}
      className="day-detail-popover"
      id={`day-detail-${day.id}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`day-detail-title-${day.id}`}
    >
      <div className="day-detail" ref={panelRef}>
        <header className="day-detail-header">
          <h3 id={`day-detail-title-${day.id}`}>Minuta del {day.name.toLowerCase()} {day.num}</h3>
          <button
            ref={closeButtonRef}
            type="button"
            className="day-detail-close"
            aria-label="Cerrar minuta y nutrición"
            onClick={() => {
              onClose();
              anchorRef.current?.focus({ preventScroll: true });
            }}
          >
            ×
          </button>
        </header>
        <div className="day-detail-body">
          <div className="menu-block">
            <h4>Menú completo</h4>
            <dl>
              <dt>Sopa</dt>
              <dd>{day.menu.sopa}</dd>
              <dt>Entrada</dt>
              <dd>{day.menu.entrada}</dd>
              <dt>{day.menu.fondoB ? 'Fondo A' : 'Fondo'}</dt>
              <dd>{day.menu.fondo}</dd>
              {day.menu.fondoB && (
                <>
                  <dt>Fondo B</dt>
                  <dd>{day.menu.fondoB}</dd>
                </>
              )}
              <dt>Vegetariano</dt>
              <dd>{day.menu.vegetariano}</dd>
              <dt>Hipocalórico</dt>
              <dd>{day.menu.hipocalorico}</dd>
              <dt>Postre</dt>
              <dd>{day.menu.postre}</dd>
            </dl>
          </div>
          <div className="nutrition-block">
            <h4>Aporte nutricional</h4>
            <div className="nutrition-tabs" role="tablist" aria-label="Tipo de menú">
              {tabs.map((t, index) => (
                <button
                  key={t.key}
                  type="button"
                  id={`nutrition-tab-${day.id}-${t.key}`}
                  className={`tab-btn ${currentTab === t.key ? 'active' : ''}`}
                  role="tab"
                  aria-selected={currentTab === t.key}
                  aria-controls={`nutrition-values-${day.id}`}
                  tabIndex={currentTab === t.key ? 0 : -1}
                  onClick={() => onChangeTab(day.id, t.key)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div
              className="nutrition-values"
              id={`nutrition-values-${day.id}`}
              role="tabpanel"
              aria-labelledby={`nutrition-tab-${day.id}-${currentTab}`}
            >
              <div className="kcal-value">
                {n.kcal} <span>kcal</span>
              </div>
              <MacroRow
                label="Proteínas"
                value={n.protein}
                max={MAX_NUTRITION.protein}
                hint="Referencia diaria: 45 g"
              />
              <MacroRow
                label="Carbohidratos"
                value={n.carbs}
                max={MAX_NUTRITION.carbs}
                hint="Referencia diaria: 105 g"
              />
              <MacroRow
                label="Grasas"
                value={n.fat}
                max={MAX_NUTRITION.fat}
                hint="Referencia diaria: 40 g"
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
