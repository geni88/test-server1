var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index',{title : "reacthomepage"});
});

// router.post('/gongsi', (req, res, next) => {
//   gongsidata(req.body.gongsiga, ({ gongsi } = {}) => {
//     return res.render('gonsi', {

//     })
//   })
// });

module.exports = router;
