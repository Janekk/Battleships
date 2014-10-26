var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/io-test', function(req, res) {
  res.render('io-test');
});

module.exports = router;
