const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const cron = require('node-cron');
const db = require('./config/db');

// Tarea diaria a medianoche para revisar suscripciones
cron.schedule('0 0 * * *', async () => {
    console.log('Revisando suscripciones...');
    const now = new Date();
    
    try {
        await db.query(`
            UPDATE subscriptions SET estado = 'expirado' 
            WHERE fecha_fin < $1 AND estado != 'expirado'
        `, [now]);

        await db.query(`
            UPDATE users SET estado = 'suspendido' 
            WHERE id IN (SELECT user_id FROM subscriptions WHERE estado = 'expirado')
        `);

        console.log('Suscripciones actualizadas.');
    } catch (err) {
        console.error('Error en el cron de suscripciones:', err);
    }
});

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

// Levantar servidor (Escuchando en 0.0.0.0 para entornos cloud)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
