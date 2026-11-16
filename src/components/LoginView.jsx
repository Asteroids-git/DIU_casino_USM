import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

export default function LoginView({ onLogin, showToast }) {
  const containerRef = useRef(null);
  const boxRef = useRef(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [vegStock, setVegStock] = useState(14);
  const [hipoStock, setHipoStock] = useState(8);
  const [vegScale, setVegScale] = useState(false);
  const [hipoScale, setHipoScale] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const box = boxRef.current;
    let animationFrame = 0;

    const fitToViewport = () => {
      const containerStyle = getComputedStyle(container);
      const boxStyle = getComputedStyle(box);
      const availableWidth = container.clientWidth
        - parseFloat(containerStyle.paddingLeft) - parseFloat(containerStyle.paddingRight) - 2;
      const availableHeight = container.clientHeight
        - parseFloat(containerStyle.paddingTop) - parseFloat(containerStyle.paddingBottom) - 2;
      if (availableWidth <= 0 || availableHeight <= 0) return;

      const width = `${Math.min(parseFloat(boxStyle.maxWidth), availableWidth)}px`;
      if (box.style.width !== width) box.style.width = width;

      const preferredScale = parseFloat(boxStyle.getPropertyValue('--login-preferred-scale'));
      const scale = Math.min(
        preferredScale,
        availableWidth / box.offsetWidth,
        availableHeight / box.offsetHeight,
      );
      const fittedScale = String(Math.floor(scale * 1000) / 1000);
      if (box.style.getPropertyValue('--login-scale') !== fittedScale) {
        box.style.setProperty('--login-scale', fittedScale);
      }
    };

    const scheduleFit = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(fitToViewport);
    };

    fitToViewport();
    const observer = new ResizeObserver(scheduleFit);
    observer.observe(container);
    observer.observe(box);
    window.addEventListener('resize', scheduleFit);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', scheduleFit);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.4) {
        setVegStock((prev) => {
          if (prev > 2) {
            setVegScale(true);
            setTimeout(() => setVegScale(false), 200);
            return prev - 1;
          }
          return prev;
        });
      }
      if (Math.random() > 0.6) {
        setHipoStock((prev) => {
          if (prev > 1) {
            setHipoScale(true);
            setTimeout(() => setHipoScale(false), 200);
            return prev - 1;
          }
          return prev;
        });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    if (/\d/.test(val)) {
      setUsernameError('El nombre de usuario no puede contener números.');
    } else {
      setUsernameError('');
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordError && val.length >= 4) {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    let hasError = false;
    if (!username.trim()) {
      setUsernameError('Ingresa tu nombre de usuario.');
      hasError = true;
    } else if (/\d/.test(username)) {
      setUsernameError('El nombre de usuario no puede contener números.');
      hasError = true;
    }

    if (password.length < 4) {
      setPasswordError('La contraseña debe tener al menos 4 caracteres.');
      hasError = true;
    }

    if (hasError) {
      showToast('Revisa los campos marcados en rojo.', 'error');
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setIsLoading(false);
    onLogin(username.trim());
  };

  return (
    <div id="login-view" className="login-container" ref={containerRef}>
      <div className="login-box" ref={boxRef}>
        <h2>Sistema Casino USM</h2>
        <p className="sub">
          Inicia sesión para gestionar tus reservas y ver los menús disponibles de esta semana
        </p>

        <form id="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="Ej: Juan Pérez"
              required
              autoComplete="username"
              value={username}
              onChange={handleUsernameChange}
              aria-invalid={!!usernameError}
              aria-describedby="username-err"
            />
            {usernameError && (
              <span className="field-error show" id="username-err" role="alert">
                {usernameError}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              aria-invalid={!!passwordError}
              aria-describedby="password-err"
            />
            <span className="field-hint">Mínimo 4 caracteres (demo).</span>
            {passwordError && (
              <span className="field-error show" id="password-err" role="alert">
                {passwordError}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-login"
            id="loginBtn"
            disabled={isLoading}
          >
            <span className="btn-label">
              {isLoading ? 'Verificando…' : 'Ingresar'}
            </span>
            {isLoading && <span className="spinner" aria-hidden="true"></span>}
          </button>
        </form>

        <div className="live-stock-section">
          <div className="live-stock-title">
            <span className="pulse-dot" aria-hidden="true"></span> Disponibilidad de platos especiales
          </div>
          <div className="stock-grid">
            <div
              className="stock-card veg"
              style={{
                transform: vegScale ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.2s ease',
              }}
            >
              <div className="st-label">🌱 Vegetariano</div>
              <div className="st-val" id="stock-veg">
                {vegStock}
              </div>
            </div>
            <div
              className="stock-card hipo"
              style={{
                transform: hipoScale ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.2s ease',
              }}
            >
              <div className="st-label">🥗 Hipocalórico</div>
              <div className="st-val" id="stock-hipo">
                {hipoStock}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
