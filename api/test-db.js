const pool = require('../db');

module.exports = async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT NOW()');
            res.status(200).json({
                status: 'ok',
                time: result.rows[0].now,
                env_check: process.env.POSTGRES_URL ? 'POSTGRES_URL is set' : 'POSTGRES_URL is MISSING'
            });
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack,
            env_check: process.env.POSTGRES_URL ? 'POSTGRES_URL is set' : 'POSTGRES_URL is MISSING'
        });
    }
};
