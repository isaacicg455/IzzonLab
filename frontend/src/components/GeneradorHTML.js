import { useState } from 'react';
import SelectorItems from './SelectorItems';
import { API, BASE_URL } from '../config';
import './GeneradorHTML.css';

function formatFecha(fecha) {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

function generarHTML(noticias, informes, tituloSemana) {
  function tarjetasPares(items, esInforme) {
    const filas = [];
    for (let i = 0; i < items.length; i += 2) {
      const a = items[i];
      const b = items[i + 1];
      const celda = (n) => {
        const enlace = n.pdf ? `${BASE_URL}${n.pdf}` : n.url;
        const etiqueta = esInforme ? 'Informe' : (n.categoria || 'Noticia');
        return `<td width="50%" valign="top" style="padding:0 8px 16px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:#ffffff;border:1px solid #ddd8d0;padding:18px 20px;">
                <p style="margin:0 0 8px 0;font-family:Helvetica,Arial,sans-serif;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;background:#1a1a1a;display:inline-block;padding:2px 7px;">${etiqueta}</p>
                <p style="margin:8px 0 6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.4;">${n.titular}</p>
                <p style="margin:0 0 14px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#aaaaaa;">${n.medio ? n.medio + ' · ' : ''}${formatFecha(n.fecha)}</p>
                <a href="${enlace}" target="_blank" style="font-family:Helvetica,Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#1a1a1a;text-decoration:underline;">${esInforme ? 'Ver informe →' : 'Leer noticia →'}</a>
              </td>
            </tr>
          </table>
        </td>`;
      };
      filas.push(`
        <tr>
          ${celda(a)}
          ${b ? celda(b) : '<td width="50%" style="padding:0 8px 16px 8px;"></td>'}
        </tr>`);
    }
    return filas.join('\n');
  }

  const seccionNoticias = noticias.length > 0 ? `
          <!-- BLOQUE NOTICIAS -->
          <tr>
            <td style="background:#1a1a1a;padding:12px 24px;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#cac4b8;">Noticias</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 16px 8px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${tarjetasPares(noticias, false)}
              </table>
            </td>
          </tr>` : '';

  const seccionInformes = informes.length > 0 ? `
          <!-- BLOQUE INFORMES -->
          <tr>
            <td style="background:#cac4b8;padding:12px 24px;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#1a1a1a;">Informes</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 16px 8px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${tarjetasPares(informes, true)}
              </table>
            </td>
          </tr>` : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${tituloSemana || 'Newsletter Izzon Lab'}</title>
</head>
<body style="margin:0;padding:0;background:#f5f3f0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f3f0;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%;">
          <tr>
            <td style="background:#1a1a1a;padding:28px 32px;text-align:center;">
              <p style="margin:0 0 6px 0;font-family:Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#cac4b8;">IZZON Lab</p>
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#555555;">${tituloSemana || 'Newsletter semanal'}</p>
            </td>
          </tr>
          ${seccionNoticias}
          ${seccionInformes}
          <tr>
            <td style="background:#1a1a1a;padding:18px 32px;text-align:center;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#555555;letter-spacing:0.06em;">IZZON Lab · Newsletter interna · ${new Date().getFullYear()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default function GeneradorHTML({ noticias }) {
  const [tituloSemana, setTituloSemana] = useState('');
  const [selNoticias, setSelNoticias] = useState([]);
  const [selInformes, setSelInformes] = useState([]);
  const [copiado, setCopiado] = useState(false);

  const [destinatarios, setDestinatarios] = useState('');
  const [asunto, setAsunto] = useState('');
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensajeEnvio, setMensajeEnvio] = useState(null);

  const todasNoticias = noticias.filter(n => n.tipo === 'noticia');
  const todosInformes = noticias.filter(n => n.tipo === 'informe');

  const noticiasSeleccionadas = todasNoticias.filter(n => selNoticias.includes(n.id));
  const informesSeleccionados = todosInformes.filter(n => selInformes.includes(n.id));
  const html = generarHTML(noticiasSeleccionadas, informesSeleccionados, tituloSemana);

  async function copiar() {
    await navigator.clipboard.writeText(html);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function enviar() {
    const lista = destinatarios.split(',').map(d => d.trim()).filter(Boolean);
    if (!lista.length || !asunto) {
      setMensajeEnvio({ texto: 'Añade al menos un destinatario y un asunto', tipo: 'error' });
      return;
    }
    setEnviando(true);
    setMensajeEnvio(null);
    try {
      const token = localStorage.getItem('izzon_token');
      const res = await fetch(`${API}/newsletter/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ destinatarios: lista, asunto, nota, html })
      });
      const data = await res.json();
      if (res.ok) {
        setMensajeEnvio({ texto: 'Newsletter enviada correctamente', tipo: 'exito' });
        setDestinatarios(''); setAsunto(''); setNota('');
      } else {
        setMensajeEnvio({ texto: data.error, tipo: 'error' });
      }
    } catch {
      setMensajeEnvio({ texto: 'Error de conexión', tipo: 'error' });
    }
    setEnviando(false);
  }

  if (noticias.length === 0) {
    return <div className="generador-vacio"><p>No hay contenido todavía.</p></div>;
  }

  return (
    <div className="generador-layout">
      <div className="generador-controls">

        <div className="gen-seccion">
          <h2 className="section-title">Contenido</h2>
          <div className="field-gen">
            <label>Título de la semana</label>
            <input value={tituloSemana} onChange={e => setTituloSemana(e.target.value)} placeholder="Ej: Semana del 24 de marzo" />
          </div>

          {todasNoticias.length > 0 && (
            <SelectorItems
              items={todasNoticias}
              seleccionados={selNoticias}
              onChange={setSelNoticias}
              tipo="noticia"
            />
          )}

          {todosInformes.length > 0 && (
            <SelectorItems
              items={todosInformes}
              seleccionados={selInformes}
              onChange={setSelInformes}
              tipo="informe"
            />
          )}
        </div>

        <div className="gen-seccion">
          <h2 className="section-title">Enviar</h2>
          <div className="field-gen">
            <label>Destinatarios *</label>
            <input value={destinatarios} onChange={e => setDestinatarios(e.target.value)} placeholder="correo1@email.com, correo2@email.com" />
            <span className="field-hint">Separa varios correos con comas</span>
          </div>
          <div className="field-gen">
            <label>Asunto *</label>
            <input value={asunto} onChange={e => setAsunto(e.target.value)} placeholder="Ej: Newsletter Izzon Lab — Semana 13" />
          </div>
          <div className="field-gen">
            <label>Nota introductoria (opcional)</label>
            <textarea value={nota} onChange={e => setNota(e.target.value)} placeholder="Texto antes de las noticias..." rows={3} />
          </div>
          {mensajeEnvio && (
            <p className={`envio-msg envio-${mensajeEnvio.tipo}`}>{mensajeEnvio.texto}</p>
          )}
          <button className="btn-enviar" onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar newsletter'}
          </button>
          <button className="btn-copiar" onClick={copiar}>
            {copiado ? 'Copiado!' : 'Copiar HTML'}
          </button>
        </div>

      </div>

      <div className="generador-preview">
        <h2 className="section-title">Vista previa</h2>
        <div className="preview-frame">
          <iframe title="preview" srcDoc={html} style={{ width: '100%', height: '700px', border: 'none' }} />
        </div>
      </div>
    </div>
  );
}
