import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faFileLines } from '@fortawesome/free-solid-svg-icons';
import './SelectorTipo.css';

export default function SelectorTipo({ onSeleccionar }) {
  return (
    <div className="selector-tipo">
      <h2 className="selector-titulo">¿Qué quieres añadir?</h2>
      <div className="selector-opciones">
        <button className="selector-card" onClick={() => onSeleccionar('noticia')}>
          <FontAwesomeIcon icon={faNewspaper} className="selector-icon" />
          <span className="selector-nombre">Noticia</span>
          <span className="selector-desc">Titular, medio, fecha y enlace a la noticia</span>
        </button>
        <button className="selector-card" onClick={() => onSeleccionar('informe')}>
          <FontAwesomeIcon icon={faFileLines} className="selector-icon" />
          <span className="selector-nombre">Informe</span>
          <span className="selector-desc">Título, autor/organización, fecha y PDF</span>
        </button>
      </div>
    </div>
  );
}
