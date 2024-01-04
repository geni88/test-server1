var express = require('express');
const home = require('../public/index.html');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('home');
});

// router.post('/gongsi', (req, res, next) => {
//   gongsidata(req.body.gongsiga, ({ gongsi } = {}) => {
//     return res.render('gonsi', {

//     })
//   })
// });

module.exports = router;
