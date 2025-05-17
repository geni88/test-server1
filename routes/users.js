var express = require('express');
var router = express.Router();
// npm install crypto --save(비번 암호화)
const crypto = require('crypto');
//npm install jsonwebtoken --save
const jwt = require('jsonwebtoken');

require('dotenv').config();

const pool = require('../Utils/mysql');
const isLoggedin = require('../Utils/isLoggedin');
const { mkdirSync } = require('fs');

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query('SELECT * FROM USER_TB');
    connection.release();
    res.json({ status: 200, arr: results });
  } catch (err) {
    console.log(err);
    res.json({ status: 500, msg: '서버에러!' })
  }
 
});

router.post('/', async (req, res, next) => {
  try {
    const email = req.body.email;
    const pwd = req.body.pwd;
    const salt = (await crypto.randomBytes(64)).toString('base64');
    const hashedPwd = (crypto.pbkdf2Sync(pwd, salt, 100000, 64, 'SHA512')).toString('base64');
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO USER_TB(email, hashed_pwd, pwd_salt) VALUES(?, ?, ?)', [email, hashedPwd, salt]);
    connection.release();
    res.json({ status: 201, msg: '저장성공' });
  } catch (err) {
    console.log(err);
    res.json({ status: 500, msg: '서버에러!' })
  }

});

router.post('/login', async (req, res, next) => {
  try {
    const email = req.body.email;
    const pwd = req.body.pwd;
    const connection = await pool.getConnection();

    const [users] = await connection.query('SELECT * FROM USER_TB WHERE email = ?', [email]);
    connection.release();
    if (users.length === 0) {
      return res.json({ status: 401, msg: '없는 이메일!' })
    }

    const user = users[0];
    const hashedPwd = (crypto.pbkdf2Sync(pwd, user.pwd_salt, 100000, 64, 'SHA512')).toString('base64');
    if (hashedPwd !== user.hashed_pwd) {
      return res.json({ status: 401, msg: '비밀번호 오류' })
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
    // res.cookie('token', token, { httpOnly: true, secure: true });
    // 'http://adfdf.com/hello?token=' + document.cookie.token;
    res.json({ status: 201, token: token });
  } catch (err) {
    console.log(err);
    res.json({ status: 500, msg: '서버에러!' })
  }

});

router.get('/profile', async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const connection = await pool.getConnection();
    const [results] = await connection.query('SELECT * FROM USER_TB');
    connection.release();
    res.json({ status: 200, arr: results });
  } catch (err) {
    console.log(err);
    res.json({ status: 500, msg: '서버에러!' })
  }

});

router.get('/me/profile', isLoggedin, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query('SELECT * FROM USER_TB WHERE id = ?', [req.userId]);
    connection.release();
    res.json({ status: 200, arr: results });
  } catch (err) {
    console.log(err);
    res.json({ status: 500, msg: '서버에러!' })
  }

});

router.get('/haja', function (req, res, next) {
  res.send('😘😘😘😘😘😘 !!!!!!');
});

router.get('/hajayo', function (req, res, next) {
  res.json({ name: 'jjjj', message: '😘😘😘😘😘😘😘😘😘' });
});

module.exports = router;
