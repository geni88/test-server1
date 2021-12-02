var express = require('express');
// const gongsidata = require('../public/javascripts/multigongsi');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.post('/gongsi', (req, res, next) => {
//   gongsidata(req.body.gongsiga, ({ gongsi } = {}) => {
//     return res.render('gonsi', {

//     })
//   })
// });

module.exports = router;
