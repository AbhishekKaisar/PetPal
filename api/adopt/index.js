const pool = require('../db');
const { parse } = require('cookie');

module.exports = async (req, res) => {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    let user;
    try {
        user = JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    if (req.method === 'GET') {
        // Only admin
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        try {
            const result = await pool.query(`
                SELECT a.*, u.full_name as applicant_name, r.name as pet_name 
                FROM adoption a
                JOIN users u ON a.user_id = u.id
                JOIN animal an ON a.animal_id = an.animal_id
                JOIN rehome r ON an.rehome_id = r.rehome_id
                ORDER BY a.created_at DESC
            `);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'POST') {
        const { animalId, numChildren, phone, numAdults, homeImage, animalProof, otherPets, otherPetsSpayed, allergies } = req.body;

        try {
            await pool.query(
                `INSERT INTO adoption 
                (user_id, animal_id, num_of_children, phone_num, num_of_adults, home_image, animal_proof, other_pets, other_pets_spayed, allergies_to_pets)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [user.id, animalId, numChildren, phone, numAdults, homeImage, animalProof, otherPets, otherPetsSpayed, allergies]
            );
            res.status(201).json({ message: 'Application submitted successfully' });
        } catch (error) {
            console.error('Adoption error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'DELETE') {
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { id } = req.query; // Assuming ID is passed as query param or we parse it from simple URL, but Vercel dynamic routes separate file.
        // Wait, index.js handles /api/adopt. DELETE /api/adopt?id=...

        try {
            await pool.query('DELETE FROM adoption WHERE adoption_id = $1', [id]);
            res.status(200).json({ message: 'Application deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
