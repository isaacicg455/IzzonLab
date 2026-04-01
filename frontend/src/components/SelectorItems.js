import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './SelectorItems.css';

export default function SelectorItems({ items, seleccionados, onChange, tipo }) {
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener('mousedown', onClickFuera);
    return () => document.removeEventListener('mousedown', onClickFuera);
  }, []);

  const disponibles = items.filter(n =>
    !seleccionados.includes(n.id) &&
    n.titular.toLowerCase().includes(busqueda.toLowerCase())
  );

  function añadir(id) {
    onChange([...seleccionados, id]);
    setBusqueda('');
  }

  function quitar(id) {
    onChange(seleccionados.filter(x => x !== id));
  }

  const esNoticias = tipo === 'noticia';

  return (
    <div className={`si-wrapper ${esNoticias ? 'si-noticias' : 'si-informes'}`}>
      <div className="si-cabecera">
        <span className="si-tipo">{esNoticias ? 'Noticias' : 'Informes'}</span>
        <span className="si-count">{seleccionados.length} seleccionados</span>
      </div>

      {/* Tags seleccionados */}
      {seleccionados.length > 0 && (
        <div className="si-tags">
          {items.filter(n => seleccionados.includes(n.id)).map(n => (
            <span key={n.id} className="si-tag">
              <span className="si-tag-texto">{n.titular}</span>
              <button className="si-tag-x" onClick={() => quitar(n.id)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown de búsqueda */}
      <div className="si-dropdown-wrapper" ref={ref}>
        <div className="si-input-row" onClick={() => setAbierto(v => !v)}>
          <input
            className="si-input"
            placeholder={`Añadir ${esNoticias ? 'noticia' : 'informe'}...`}
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setAbierto(true); }}
            onClick={e => { e.stopPropagation(); setAbierto(true); }}
          />
          <FontAwesomeIcon icon={faChevronDown} className={`si-chevron ${abierto ? 'si-chevron-open' : ''}`} />
        </div>

        {abierto && (
          <ul className="si-lista">
            {disponibles.length === 0 ? (
              <li className="si-lista-vacio">
                {items.length === seleccionados.length ? 'Todos añadidos' : 'Sin resultados'}
              </li>
            ) : (
              disponibles.map(n => (
                <li key={n.id} className="si-opcion" onClick={() => añadir(n.id)}>
                  <span className="si-opcion-titular">{n.titular}</span>
                  <span className="si-opcion-meta">
                    {n.categoria ? `${n.categoria} · ` : ''}{n.fecha}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
