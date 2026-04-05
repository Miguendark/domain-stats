const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

// Confirmar pago y activar suscripción
router.post('/confirm', auth, async (req, res) => {
    const { session_id, plan } = req.body;
    try {
        // En producción: Validar session_id con Stripe API
        
        // 1. Activar usuario
        await db.query('UPDATE users SET estado = $1 WHERE id = $2', ['activo', req.user.id]);

        // 2. Crear suscripción (30 días de duración)
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 30);

        await db.query(
            'INSERT INTO subscriptions (user_id, plan, fecha_fin) VALUES ($1, $2, $3)',
            [req.user.id, plan, fechaFin]
        );

        res.json({ message: 'Pago confirmado y cuenta activada' });
    } catch (err) {
        res.status(500).json({ error: 'Error al confirmar pago' });
    }
});

module.exports = router;
