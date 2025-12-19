const pool = require('../db');
const { parse } = require('cookie');

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        const { type, age, breed } = req.query;
        let query = `
            SELECT r.*, a.image as animal_image 
            FROM rehome r 
            LEFT JOIN animal a ON r.rehome_id = a.rehome_id
        `;
        const params = [];
        const conditions = [];

        if (type) {
            conditions.push(`r.type = $${params.length + 1}`);
            params.push(type);
        }
        // Add more filters as needed

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY r.created_at DESC';

        try {
            const result = await pool.query(query, params);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching pets:', error);
            res.status(500).json({ error: error.message });
        }
    } else if (req.method === 'POST') {
        // Authenticate
        const cookies = parse(req.headers.cookie || '');
        const token = cookies.auth_token;
        if (!token) return res.status(401).json({ error: 'Not authenticated' });

        let user;
        try {
            user = JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
        } catch (e) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { type, name, gender, age, breed, vaccinated, potty_trained, image, reason } = req.body;

        try {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Insert into Rehome table
                const rehomeRes = await client.query(
                    'INSERT INTO rehome (user_id, type, name, gender, age, breed, vaccinated, potty_trained, image, reason_behind_rehome) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING rehome_id',
                    [user.id, type, name, gender, age, breed, vaccinated, potty_trained, image, reason]
                );
                const rehomeId = rehomeRes.rows[0].rehome_id;

                // Insert into Animal table (redundant in schema but requested by user's initial sql structure implies separation, merging for simplicity in logic but keeping tables as user had them)
                // Actually my new schema kept them separate to match user's mental model, let's populate both.
                await client.query(
                    'INSERT INTO animal (rehome_id, type, name, gender, age, breed, vaccinated, potty_trained, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                    [rehomeId, type, name, gender, age, breed, vaccinated, potty_trained, image]
                );

                await client.query('COMMIT');
                res.status(201).json({ message: 'Pet listed successfully', rehomeId });
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error creating pet:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
