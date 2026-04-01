import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import { API } from '../config';
import './ModalLogin.css';

export default function ModalLogin({ onClose }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token);
        onClose();
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch {
      setError('No se pudo conectar con el servidor');
    }
    setCargando(false);
  }

  return (
    <Modal onClose={onClose}>
      <div className="login-box">
        <h2 className="login-titulo">Acceso</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Usuario</label>
            <input
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn-submit" disabled={cargando}>
            {cargando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </Modal>
  );
}
