import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faXmark } from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../config';
import './GridNoticias.css';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const CATEGORIAS = ['Izzon Lab','Industria','Contexto','Clientes','Proveedores','Competencia','Asociaciones'];

function formatFecha(fecha) {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

function agruparPorMes(items) {
  const grupos = {};
  items.forEach(n => {
    if (!n.fecha) return;
    const [y, m] = n.fecha.split('-');
    const clave = `${y}-${m}`;
    const label = `${MESES[parseInt(m,10)-1]} ${y}`;
    if (!grupos[clave]) grupos[clave] = { label, items: [] };
    grupos[clave].items.push(n);
  });
  return Object.entries(grupos)
    .sort(([a],[b]) => b.localeCompare(a))
    .map(([,g]) => g);
}

function Tarjeta({ n, onEliminar, onEditar, autenticado }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <article ref={ref} className={`tarjeta ${visible ? 'tarjeta-visible' : ''}`}>
      <div className="tarjeta-header">
        {n.categoria && <span className="tarjeta-categoria">{n.categoria}</span>}
      </div>
      <h3 className="tarjeta-titular">{n.titular}</h3>
      <p className="tarjeta-meta">
        {n.medio && <>{n.medio} &middot; </>}{formatFecha(n.fecha)}
      </p>
      <div className="tarjeta-footer">
        <a
          href={n.pdf ? `${BASE_URL}${n.pdf}` : n.url}
          target="_blank"
          rel="noreferrer"
          className="tarjeta-enlace"
        >
          {n.pdf ? 'Ver PDF' : 'Leer'} &rarr;
        </a>
        {autenticado && (
          <div className="tarjeta-acciones">
            <button className="tarjeta-accion editar" title="Editar" onClick={() => onEditar(n)}>
              <FontAwesomeIcon icon={faPen} />
            </button>
            <button
              className="tarjeta-accion eliminar"
              title="Eliminar"
              onClick={() => {
                if (window.confirm('¿Seguro que quieres eliminar este elemento?')) {
                  onEliminar(n.id);
                }
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function GridNoticias({ noticias, onEliminar, onEditar, autenticado }) {
  const [tipoPrincipal, setTipoPrincipal] = useState('noticia');
  const [categoria, setCategoria] = useState('');
  const [mes, setMes] = useState('');

  const año = new Date().getFullYear();

  function cambiarTipo(tipo) {
    setTipoPrincipal(tipo);
    setCategoria('');
    setMes('');
  }

  const porTipo = noticias.filter(n => n.tipo === tipoPrincipal);

  const filtradas = porTipo.filter(n => {
    const passCategoria = !categoria || n.categoria === categoria;
    const passMes = !mes || (n.fecha && n.fecha.slice(5, 7) === mes);
    return passCategoria && passMes;
  });

  const grupos = agruparPorMes(filtradas);

  return (
    <div className="grid-wrapper">

      {/* TABS PRINCIPALES */}
      <div className="filtros-principales">
        <button
          className={tipoPrincipal === 'noticia' ? 'filtro-principal active' : 'filtro-principal'}
          onClick={() => cambiarTipo('noticia')}
        >
          Noticias
          <span className="filtro-count">{noticias.filter(n => n.tipo === 'noticia').length}</span>
        </button>
        <button
          className={tipoPrincipal === 'informe' ? 'filtro-principal active' : 'filtro-principal'}
          onClick={() => cambiarTipo('informe')}
        >
          Informes
          <span className="filtro-count">{noticias.filter(n => n.tipo === 'informe').length}</span>
        </button>
      </div>

      {/* FILTROS SECUNDARIOS */}
      <div className="filtros-secundarios">
        {tipoPrincipal === 'noticia' && (
          <div className="field">
            <label>Categoría</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)}>
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        <div className="field">
          <label>Mes</label>
          <select value={mes} onChange={e => setMes(e.target.value)}>
            <option value="">Todos los meses</option>
            {MESES.map((m, i) => (
              <option key={m} value={String(i + 1).padStart(2, '0')}>{m} {año}</option>
            ))}
          </select>
        </div>
      </div>

      {/* GRID */}
      {filtradas.length === 0 ? (
        <div className="grid-vacio">
          <p>No hay contenido para los filtros seleccionados.</p>
        </div>
      ) : (
        grupos.map(grupo => (
          <div key={grupo.label} className="grupo-mes">
            <div className="mes-divider">
              <span className="mes-label">{grupo.label}</span>
            </div>
            <div className="grid-noticias">
              {grupo.items.map(n => (
                <Tarjeta key={n.id} n={n} onEliminar={onEliminar} onEditar={onEditar} autenticado={autenticado} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
