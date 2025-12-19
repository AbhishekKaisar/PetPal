const { serialize } = require('cookie');

module.exports = (req, res) => {
    const serialized = serialize('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: -1,
        path: '/'
    });

    res.setHeader('Set-Cookie', serialized);
    res.status(200).json({ message: 'Logged out successfully' });
};
