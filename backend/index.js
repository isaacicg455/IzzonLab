const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { randomUUID: uuidv4 } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'izzon_lab_secret_2024_x9kp2m';

const DATA_FILE   = path.join(__dirname, 'data', 'noticias.json');
const USER_FILE   = path.join(__dirname, 'data', 'usuario.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Crear carpetas y ficheros si no existen
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
if (!fs.existsSync(USER_FILE)) {
  const hash = require('bcrypt').hashSync(process.env.USER_PASSWORD || 'Zaqwsx1!', 12);
  fs.writeFileSync(USER_FILE, JSON.stringify({ usuario: process.env.USERNAME_APP || 'martaizzonlab', password: hash }));
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL || 'isaacicg455@gmail.com',
    pass: process.env.EMAIL_PASSWORD || ''
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Solo se permiten PDFs'));
  }
});

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'No autorizado' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// POST login
app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password)
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });

  const userData = JSON.parse(fs.readFileSync(USER_FILE, 'utf8'));
  if (usuario !== userData.usuario)
    return res.status(401).json({ error: 'Credenciales incorrectas' });

  const ok = await bcrypt.compare(password, userData.password);
  if (!ok)
    return res.status(401).json({ error: 'Credenciales incorrectas' });

  const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// POST enviar newsletter
app.post('/api/newsletter/enviar', authMiddleware, async (req, res) => {
  const { destinatarios, asunto, nota, html } = req.body;

  if (!destinatarios || !destinatarios.length || !asunto || !html)
    return res.status(400).json({ error: 'Faltan campos obligatorios' });

  const cuerpo = nota
    ? `<div style="font-family:Helvetica,Arial,sans-serif;padding:16px 0 24px;color:#555;font-size:14px;max-width:600px;">${nota}</div>${html}`
    : html;

  try {
    await transporter.sendMail({
      from: `"Izzon Lab" <${process.env.EMAIL || 'isaacicg455@gmail.com'}>`,
      to: destinatarios.join(', '),
      subject: asunto,
      html: cuerpo
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar el correo: ' + err.message });
  }
});

// GET todas las noticias (público)
app.get('/api/noticias', (req, res) => {
  res.json(readData());
});

// POST nueva noticia o informe (protegido)
app.post('/api/noticias', authMiddleware, upload.single('pdf'), (req, res) => {
  const { tipo, titular, medio, fecha, url, categoria } = req.body;

  if (!titular || !fecha)
    return res.status(400).json({ error: 'Titular y fecha son obligatorios' });
  if (tipo !== 'informe' && !url && !req.file)
    return res.status(400).json({ error: 'Debes proporcionar una URL o subir un PDF' });
  if (tipo === 'informe' && !req.file)
    return res.status(400).json({ error: 'El informe requiere un PDF' });

  const noticia = {
    id: uuidv4(),
    tipo: tipo || 'noticia',
    categoria: categoria || null,
    titular,
    medio,
    fecha,
    url: req.file ? null : url,
    pdf: req.file ? `/uploads/${req.file.filename}` : null,
    creadoEn: new Date().toISOString()
  };

  const data = readData();
  data.push(noticia);
  writeData(data);
  res.status(201).json(noticia);
});

// PUT editar noticia (protegido)
app.put('/api/noticias/:id', authMiddleware, upload.single('pdf'), (req, res) => {
  const data = readData();
  const idx = data.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrada' });

  const { titular, medio, fecha, url, categoria } = req.body;
  const noticia = data[idx];

  if (req.file) {
    if (noticia.pdf) {
      const old = path.join(__dirname, noticia.pdf);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }
    noticia.pdf = `/uploads/${req.file.filename}`;
    noticia.url = null;
  } else if (url !== undefined) {
    noticia.url = url || null;
    noticia.pdf = noticia.pdf; // keep existing pdf if url not changed
  }

  noticia.titular = titular || noticia.titular;
  noticia.medio = medio !== undefined ? medio : noticia.medio;
  noticia.fecha = fecha || noticia.fecha;
  noticia.categoria = categoria !== undefined ? categoria : noticia.categoria;

  writeData(data);
  res.json(noticia);
});

// DELETE noticia (protegido)
app.delete('/api/noticias/:id', authMiddleware, (req, res) => {
  const data = readData();
  const noticia = data.find(n => n.id === req.params.id);

  if (!noticia) return res.status(404).json({ error: 'No encontrada' });

  if (noticia.pdf) {
    const filePath = path.join(__dirname, noticia.pdf);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  writeData(data.filter(n => n.id !== req.params.id));
  res.json({ ok: true });
});

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(frontendBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));
