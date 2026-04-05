const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/track
router.post('/', async (req, res) => {
    const { subdomainId, type } = req.body;

    if (!subdomainId || !type) {
        return res.status(400).json({ error: 'Faltan parámetros de rastreo' });
    }

    try {
        // 1. Validar que el subdominio existe
        const subdomainCheck = await db.query('SELECT id FROM subdomains WHERE id = $1', [subdomainId]);
        if (subdomainCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Subdominio no registrado' });
        }

        const fieldToIncrement = type === 'impression' ? 'impresiones' : 'clics';
        const today = new Date().toISOString().split('T')[0];

        // 2. UPSERT: Incrementar contadores en la tabla stats para el día actual
        const query = `
            INSERT INTO stats (subdomain_id, fecha, ${fieldToIncrement})
            VALUES ($1, $2, 1)
            ON CONFLICT (subdomain_id, fecha) 
            DO UPDATE SET ${fieldToIncrement} = stats.${fieldToIncrement} + 1
            RETURNING *;
        `;

        await db.query(query, [subdomainId, today]);

        // 3. Responder rápido (status 204 No Content es ideal para tracking)
        res.sendStatus(204);
    } catch (err) {
        console.error('[Track Error]:', err);
        res.status(500).json({ error: 'Error interno de rastreo' });
    }
});

module.exports = router;
