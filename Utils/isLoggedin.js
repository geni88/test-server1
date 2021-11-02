const jwt = require('jsonwebtoken');
require('dotenv').config();

const isLoggedin = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = payload.id;
        req.userId = userId;
        next();
    } catch (err) {
        return res.json({ status: 401, msg: '권한없음!' })
    }

}

module.exports = isLoggedin;