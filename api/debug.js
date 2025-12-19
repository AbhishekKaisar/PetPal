const pool = require('./db');

module.exports = async (req, res) => {
    try {
        // Try to connect
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();

        // Check if env var looks weird (quotes)
        const url = process.env.POSTGRES_URL || '';
        const hasQuotes = url.startsWith('"') || url.startsWith("'");

        res.status(200).json({
            status: 'Connected successfully',
            time: result.rows[0],
            env_check: {
                exists: !!url,
                begins_with: url.substring(0, 15) + '...',
                has_quotes: hasQuotes
            }
        });
    } catch (err) {
        const url = process.env.POSTGRES_URL || '';
        res.status(500).json({
            error: err.message,
            stack: err.stack,
            env_check: {
                exists: !!url,
                begins_with: url.substring(0, 15) + '...',
            }
        });
    }
};
