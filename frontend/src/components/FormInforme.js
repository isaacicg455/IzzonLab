import { useState } from 'react';
import './Form.css';

const ESTADO_INICIAL = { titulo: '', fecha: '', pdf: null };

export default function FormInforme({ onSubmit }) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [cargando, setCargando] = useState(false);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === 'pdf') setForm(f => ({ ...f, pdf: files[0] || null }));
    else setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    const data = new FormData();
    data.append('tipo', 'informe');
    data.append('titular', form.titulo);
    data.append('fecha', form.fecha);
    data.append('medio', '');
    data.append('pdf', form.pdf);
    await onSubmit(data);
    setForm(ESTADO_INICIAL);
    setCargando(false);
  }

  const valido = form.titulo && form.fecha && form.pdf;

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label>Título *</label>
        <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Nombre del informe" required />
      </div>
      <div className="field">
        <label>Fecha *</label>
        <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
      </div>
      <div className="field">
        <label>PDF *</label>
        <input type="file" name="pdf" accept=".pdf" onChange={handleChange} required />
        {form.pdf && <span className="pdf-nombre">{form.pdf.name}</span>}
      </div>
      <button type="submit" className="btn-submit" disabled={!valido || cargando}>
        {cargando ? 'Guardando...' : 'Añadir informe'}
      </button>
    </form>
  );
}
