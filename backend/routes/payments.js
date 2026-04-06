const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Obtener historial de pagos del usuario
router.get('/', auth, async (req, res) => {
    try {
        const payments = await db.query(
            'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(payments.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener pagos' });
    }
});

module.exports = router;
