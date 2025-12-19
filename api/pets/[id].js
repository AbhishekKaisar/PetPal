const pool = require('../../db');
const { parse } = require('cookie');

module.exports = async (req, res) => {
    const { id } = req.query; // Vercel passes dynamic route param as query param

    if (req.method === 'GET') {
        try {
            const result = await pool.query('SELECT * FROM rehome WHERE rehome_id = $1', [id]);
            if (result.rows.length === 0) return res.status(404).json({ error: 'Pet not found' });
            res.status(200).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'DELETE') {
        // Auth check
        const cookies = parse(req.headers.cookie || '');
        const token = cookies.auth_token;
        if (!token) return res.status(401).json({ error: 'Not authenticated' });

        let user;
        try {
            user = JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
        } catch (e) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        try {
            // Check ownership or admin
            const check = await pool.query('SELECT user_id FROM rehome WHERE rehome_id = $1', [id]);
            if (check.rows.length === 0) return res.status(404).json({ error: 'Pet not found' });

            if (check.rows[0].user_id !== user.id && user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            await pool.query('DELETE FROM rehome WHERE rehome_id = $1', [id]);
            res.status(200).json({ message: 'Pet deleted' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
