const jwt = require('jsonwebtoken');
require('dotenv').config();
const isLoggedin = async (req, res, next) => {
    const token = req.headers.authorization;
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = payload.id;
        req.userId = userId;
        next();
    } catch (err) {
        return res.json({ status: 401, msg: 'κΆνμμ!' })
    }
}

module.exports = isLoggedin;
