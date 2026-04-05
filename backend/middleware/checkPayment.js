const db = require('../config/db');

module.exports = async (req, res, next) => {
    try {
        // Los administradores siempre tienen acceso
        if (req.user.rol === 'admin') return next();

        const user = await db.query('SELECT estado_pago FROM users WHERE id = $1', [req.user.id]);
        
        if (!user.rows[0].estado_pago) {
            return res.status(403).json({ 
                error: 'Suscripción inactiva', 
                message: 'Por favor, realiza el pago para acceder a esta sección.' 
            });
        }
        
        next();
    } catch (err) {
        res.status(500).json({ error: 'Error al verificar suscripción' });
    }
};
