var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Börd Casino' });
});

router.get('/io-test', function(req, res) {
  res.render('io-test', { containerCss: 'io-test' });
});

module.exports = router;
