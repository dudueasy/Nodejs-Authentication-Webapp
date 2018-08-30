var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'registration' });
});

router.post('/register', function(req, res, next) {
  let {username, email, password, passwordMatch} = req.body 
  console.log(username, email, password, passwordMatch)

  const connection = require('../db.js')

  let query = `INSERT INTO users (username, email, password) VALUES (?,?,?)`

  connection.query(query, [username, email, password], (err, results, fields)=>{
    if(err) throw err; 
    res.render('register', { title: 'registration completed' }); 
  }) 
});

module.exports = router;
