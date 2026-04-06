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

app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected', timestamp: new Date() });
    } catch (err) {
        res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('API de DomainStats funcionando 🚀');
});

const fs = require('fs');
const path = require('path');

// Función de migración automática
const runMigrations = async () => {
    try {
        console.log('Iniciando migraciones...');
        const schema = fs.readFileSync(path.join(__dirname, 'models', 'schema.sql'), 'utf8');
        await db.query(schema);
        console.log('Tablas verificadas/creadas con éxito 🎉');

        // Solo insertar semillas en desarrollo o si se desea poblar inicialmente
        if (process.env.NODE_ENV !== 'production' || process.env.RUN_SEEDS === 'true') {
            const seeds = fs.readFileSync(path.join(__dirname, 'models', 'seeds.sql'), 'utf8');
            await db.query(seeds);
            console.log('Datos de prueba insertados con éxito 🧪');
        }
    } catch (err) {
        console.error('Error en migraciones:', err);
    }
};

// Levantar servidor
app.listen(PORT, '0.0.0.0', async () => {
    await runMigrations();
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
