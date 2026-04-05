const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Función mock para validar API de Google Ad Manager
const validateGoogleAdsAPI = async (clientId, clientSecret) => {
    // Aquí iría la lógica real con googleapis
    // Por ahora, simulamos una validación (falla si el secret es 'error')
    if (!clientId || !clientSecret || clientSecret === 'error') {
        throw new Error('Credenciales de API inválidas');
    }
    return true;
};

// Registro de usuarios (Paso 1: Validación + Creación pendiente)
router.post('/register', async (req, res) => {
    const { nombre, correo, password, api_client_id, api_client_secret } = req.body;
    try {
        const userExists = await db.query('SELECT * FROM users WHERE correo = $1', [correo]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // 1. Validar API antes de registrar
        try {
            await validateGoogleAdsAPI(api_client_id, api_client_secret);
        } catch (apiErr) {
            return res.status(400).json({ error: apiErr.message });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.query(
            'INSERT INTO users (nombre, correo, password, api_client_id, api_client_secret, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, correo',
            [nombre, correo, hashedPassword, api_client_id, api_client_secret, 'pendiente_pago']
        );

        // Generar token temporal para el proceso de pago
        const token = jwt.sign(
            { id: newUser.rows[0].id, rol: 'dueño' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ user: newUser.rows[0], token });
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { correo, password } = req.body;
    try {
        const user = await db.query('SELECT * FROM users WHERE correo = $1', [correo]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, rol: user.rows[0].rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.rows[0].id, nombre: user.rows[0].nombre, rol: user.rows[0].rol } });
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
