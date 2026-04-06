const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Obtener estadísticas globales simplificadas
router.get('/dashboard/summary', auth, async (req, res) => {
    try {
        const summary = await db.query(`
            SELECT 
                COALESCE(SUM(impressions), 0) as total_impresiones,
                COALESCE(SUM(clicks), 0) as total_clics,
                COALESCE(AVG(ctr), 0) as avg_ctr,
                COALESCE(SUM(revenue), 0) as total_ingresos
            FROM stats 
            JOIN domains ON stats.domain_id = domains.id
            WHERE domains.user_id = $1
        `, [req.user.id]);
        
        res.json(summary.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al cargar resumen' });
    }
});

module.exports = router;
