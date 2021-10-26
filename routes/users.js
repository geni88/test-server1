var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/haja', function (req, res, next) {
  res.send('min jeong  😘😘😘😘😘😘 난 내일 출장이야!!!!!!');
});

router.get('/hajayo', function (req, res, next) {
  res.json({ name: 'haha', age: '??' });
});

module.exports = router;
