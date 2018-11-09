var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send(process.env.NODE_ENV);
  res.send('respond with a resource');
});

module.exports = router;
