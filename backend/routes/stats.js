const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkPayment = require('../middleware/checkPayment');
const db = require('../config/db');

// Obtener estadísticas por subdominio (con protección de acceso)
router.get('/:subdomain_id', auth, checkPayment, async (req, res) => {
    const { subdomain_id } = req.params;
    try {
        // Verificar si el usuario tiene acceso a este subdominio
        let checkQuery = 'SELECT id FROM subdomains WHERE id = $1 AND user_id = $2';
        
        // Si el usuario es el dueño del dominio principal, también puede ver sus subdominios
        if (req.user.rol === 'dueño') {
            checkQuery = `
                SELECT s.id FROM subdomains s
                JOIN domains d ON s.domain_id = d.id
                WHERE s.id = $1 AND d.user_id = $2
            `;
        } else if (req.user.rol === 'admin') {
            checkQuery = 'SELECT id FROM subdomains WHERE id = $1';
        }

        const access = await db.query(checkQuery, req.user.rol === 'admin' ? [subdomain_id] : [subdomain_id, req.user.id]);

        if (access.rows.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado a este subdominio' });
        }

        const stats = await db.query(
            'SELECT * FROM stats WHERE subdomain_id = $1 ORDER BY fecha DESC LIMIT 30',
            [subdomain_id]
        );
        res.json(stats.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// Resumen global para el dashboard principal
router.get('/dashboard/summary', auth, async (req, res) => {
    try {
        // Lógica para filtrar por rol
        const summary = await db.query(`
            SELECT 
                SUM(impresiones) as total_impresiones,
                SUM(clics) as total_clics,
                AVG(ctr) as avg_ctr,
                SUM(ingresos) as total_ingresos
            FROM stats 
            JOIN subdomains ON stats.subdomain_id = subdomains.id
            JOIN domains ON subdomains.domain_id = domains.id
            WHERE domains.user_id = $1
        `, [req.user.id]);
        
        res.json(summary.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al cargar resumen' });
    }
});

module.exports = router;
