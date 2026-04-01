import { useState } from 'react';
import './Form.css';

const CATEGORIAS = ['Izzon Lab','Industria','Contexto','Clientes','Proveedores','Competencia','Asociaciones'];
const ESTADO_INICIAL = { titular: '', fecha: '', medio: '', categoria: '', tipo_enlace: 'url', url: '', pdf: null };

export default function FormNoticia({ onSubmit }) {
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
    data.append('tipo', 'noticia');
    data.append('titular', form.titular);
    data.append('fecha', form.fecha);
    data.append('medio', form.medio);
    data.append('categoria', form.categoria);
    if (form.tipo_enlace === 'url') data.append('url', form.url);
    else data.append('pdf', form.pdf);
    await onSubmit(data);
    setForm(ESTADO_INICIAL);
    setCargando(false);
  }

  const enlaceValido = form.tipo_enlace === 'url' ? !!form.url : !!form.pdf;
  const valido = form.titular && form.fecha && form.medio && form.categoria && enlaceValido;

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label>Titular *</label>
        <input name="titular" value={form.titular} onChange={handleChange} placeholder="Título de la noticia" required />
      </div>
      <div className="field">
        <label>Fecha *</label>
        <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
      </div>
      <div className="field">
        <label>Medio *</label>
        <input name="medio" value={form.medio} onChange={handleChange} placeholder="El País, El Mundo..." required />
      </div>
      <div className="field">
        <label>Categoría *</label>
        <select name="categoria" value={form.categoria} onChange={handleChange} required>
          <option value="">Selecciona una categoría</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Enlace *</label>
        <div className="tipo-toggle">
          <button type="button" className={form.tipo_enlace === 'url' ? 'tipo-btn active' : 'tipo-btn'}
            onClick={() => setForm(f => ({ ...f, tipo_enlace: 'url', pdf: null }))}>
            Link
          </button>
          <button type="button" className={form.tipo_enlace === 'pdf' ? 'tipo-btn active' : 'tipo-btn'}
            onClick={() => setForm(f => ({ ...f, tipo_enlace: 'pdf', url: '' }))}>
            PDF
          </button>
        </div>
      </div>
      {form.tipo_enlace === 'url' ? (
        <div className="field">
          <input name="url" value={form.url} onChange={handleChange} placeholder="https://..." required />
        </div>
      ) : (
        <div className="field">
          <input type="file" name="pdf" accept=".pdf" onChange={handleChange} required />
          {form.pdf && <span className="pdf-nombre">{form.pdf.name}</span>}
        </div>
      )}
      <button type="submit" className="btn-submit" disabled={!valido || cargando}>
        {cargando ? 'Guardando...' : 'Añadir noticia'}
      </button>
    </form>
  );
}
