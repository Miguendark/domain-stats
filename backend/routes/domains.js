const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Obtener dominios del usuario logueado
router.get('/', auth, async (req, res) => {
    try {
        let query = 'SELECT * FROM domains WHERE user_id = $1';
        if (req.user.rol === 'admin') query = 'SELECT * FROM domains';
        
        const domains = await db.query(query, [req.user.id]);
        res.json(domains.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener dominios' });
    }
});

// Registrar nuevo dominio
router.post('/', auth, async (req, res) => {
    const { nombre } = req.body;
    try {
        const newDomain = await db.query(
            'INSERT INTO domains (nombre, user_id) VALUES ($1, $2) RETURNING *',
            [nombre, req.user.id]
        );
        res.status(201).json(newDomain.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar dominio' });
    }
});

// Añadir subdominio a un dominio
router.post('/:id/subdomains', auth, async (req, res) => {
    const { nombre, user_id_asignado } = req.body;
    const domainId = req.params.id;
    try {
        const newSubdomain = await db.query(
            'INSERT INTO subdomains (nombre, domain_id, user_id) VALUES ($1, $2, $3) RETURNING *',
            [nombre, domainId, user_id_asignado]
        );
        res.status(201).json(newSubdomain.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear subdominio' });
    }
});

module.exports = router;
