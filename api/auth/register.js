const pool = require('../db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check if user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate username from email (simple logic)
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

        // Insert user
        const newUser = await pool.query(
            'INSERT INTO users (full_name, email, password, username, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role',
            [fullName, email, hashedPassword, username, 'user']
        );

        res.status(201).json({ message: 'User created successfully', user: newUser.rows[0] });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
