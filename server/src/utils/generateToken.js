const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'rozgaarsetu_secret_key_change_me', {
        expiresIn: '30d',
    });
};

module.exports = generateToken;
