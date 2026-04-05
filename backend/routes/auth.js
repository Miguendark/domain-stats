const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Registro de usuarios
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role',
            [name, email, hashedPassword]
        );

        const token = jwt.sign(
            { id: newUser.rows[0].id, role: newUser.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ user: newUser.rows[0], token });
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.rows[0].id, name: user.rows[0].name, role: user.rows[0].role } });
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
