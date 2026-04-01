import { useState } from 'react';
import './Form.css';

function estadoDesde(inicial) {
  if (!inicial) return { titulo: '', fecha: '', pdf: null };
  return { titulo: inicial.titular || '', fecha: inicial.fecha || '', pdf: null };
}

export default function FormInforme({ onSubmit, inicial }) {
  const [form, setForm] = useState(() => estadoDesde(inicial));
  const [cargando, setCargando] = useState(false);
  const esEdicion = !!inicial;

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
    if (form.pdf) data.append('pdf', form.pdf);
    await onSubmit(data);
    if (!esEdicion) setForm(estadoDesde(null));
    setCargando(false);
  }

  const valido = form.titulo && form.fecha && (esEdicion || form.pdf);

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
        <label>PDF {!esEdicion && '*'}</label>
        <input type="file" name="pdf" accept=".pdf" onChange={handleChange} />
        {form.pdf && <span className="pdf-nombre">{form.pdf.name}</span>}
        {esEdicion && inicial.pdf && !form.pdf && (
          <span className="pdf-nombre">PDF actual: {inicial.pdf.split('/').pop()}</span>
        )}
      </div>
      <button type="submit" className="btn-submit" disabled={!valido || cargando}>
        {cargando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Añadir informe'}
      </button>
    </form>
  );
}
