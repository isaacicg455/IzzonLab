import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './context/AuthContext';
import GridNoticias from './components/GridNoticias';
import GeneradorHTML from './components/GeneradorHTML';
import Modal from './components/Modal';
import ModalLogin from './components/ModalLogin';
import SelectorTipo from './components/SelectorTipo';
import FormNoticia from './components/FormNoticia';
import FormInforme from './components/FormInforme';
import Hero from './components/Hero';
import { API } from './config';
import './App.css';

export default function App() {
  const { autenticado, logout, authHeader } = useAuth();
  const [noticias, setNoticias] = useState([]);
  const [vista, setVista] = useState('noticias');
  const [modal, setModal] = useState(null);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    cargarNoticias();
  }, []);

  async function cargarNoticias() {
    const res = await fetch(`${API}/noticias`);
    setNoticias(await res.json());
  }

  async function agregarItem(formData) {
    const res = await fetch(`${API}/noticias`, {
      method: 'POST',
      headers: authHeader(),
      body: formData
    });
    if (res.ok) {
      await cargarNoticias();
      setModal(null);
      mostrarMensaje('Añadido correctamente', 'exito');
    } else {
      const err = await res.json();
      mostrarMensaje(err.error, 'error');
    }
  }

  async function editarItem(formData) {
    const res = await fetch(`${API}/noticias/${editando.id}`, {
      method: 'PUT',
      headers: authHeader(),
      body: formData
    });
    if (res.ok) {
      await cargarNoticias();
      setModal(null);
      setEditando(null);
      mostrarMensaje('Guardado correctamente', 'exito');
    } else {
      const err = await res.json();
      mostrarMensaje(err.error, 'error');
    }
  }

  async function eliminarNoticia(id) {
    const res = await fetch(`${API}/noticias/${id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    if (res.ok) {
      await cargarNoticias();
      mostrarMensaje('Eliminado', 'exito');
    }
  }

  function mostrarMensaje(texto, tipo) {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  }

  return (
    <div className="app">
      <Hero onScroll={() => document.getElementById('contenido').scrollIntoView({ behavior: 'smooth' })} />

      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-tabs">
            <button
              className={vista === 'noticias' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setVista('noticias')}
            >
              Noticias e Informes
            </button>
            {autenticado && (
              <button
                className={vista === 'newsletter' ? 'nav-btn active' : 'nav-btn'}
                onClick={() => setVista('newsletter')}
              >
                Generar newsletter
              </button>
            )}
          </div>

          <div className="navbar-acciones">
            {autenticado && (
              <button className="btn-anadir" onClick={() => setModal('selector')}>
                + Añadir
              </button>
            )}
            {autenticado ? (
              <button className="btn-user activo" onClick={logout} title="Cerrar sesión">
                <FontAwesomeIcon icon={faRightFromBracket} />
              </button>
            ) : (
              <button className="btn-user" onClick={() => setModal('login')} title="Iniciar sesión">
                <FontAwesomeIcon icon={faUser} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {mensaje && (
        <div className={`toast toast-${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      <main className="main" id="contenido">
        {vista === 'noticias'
          ? <GridNoticias
              noticias={noticias}
              onEliminar={eliminarNoticia}
              onEditar={(item) => { setEditando(item); setModal('editar'); }}
              autenticado={autenticado}
            />
          : <GeneradorHTML noticias={noticias} />
        }
      </main>

      {modal === 'login' && <ModalLogin onClose={() => setModal(null)} />}
      {modal === 'selector' && (
        <Modal onClose={() => setModal(null)}>
          <SelectorTipo onSeleccionar={(tipo) => setModal(tipo)} />
        </Modal>
      )}
      {modal === 'noticia' && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="modal-title">Nueva noticia</h2>
          <FormNoticia onSubmit={agregarItem} />
        </Modal>
      )}
      {modal === 'informe' && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="modal-title">Nuevo informe</h2>
          <FormInforme onSubmit={agregarItem} />
        </Modal>
      )}
      {modal === 'editar' && editando && (
        <Modal onClose={() => { setModal(null); setEditando(null); }}>
          <h2 className="modal-title">Editar {editando.tipo === 'informe' ? 'informe' : 'noticia'}</h2>
          {editando.tipo === 'informe'
            ? <FormInforme onSubmit={editarItem} inicial={editando} />
            : <FormNoticia onSubmit={editarItem} inicial={editando} />
          }
        </Modal>
      )}
    </div>
  );
}
