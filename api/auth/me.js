const { parse } = require('cookie');

module.exports = (req, res) => {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const user = JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
        res.status(200).json({ user });
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
