const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const cron = require('node-cron');
const db = require('./config/db');

// Tarea diaria... (resto del cron igual)
...
// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.static('public')); // Servir tracking.js

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/domains', require('./routes/domains'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/track', require('./routes/track'));

app.get('/', (req, res) => {
    res.send('API de DomainStats funcionando 🚀');
});

// Levantar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
