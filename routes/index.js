var express = require('express');
var router = express.Router(); 
const { check, validationResult } = require('express-validator/check');

/* GET home page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'registration' });
});

router.post('/register', 
  [check('username').isLength({min: 5}), check('email').isEmail(), check('password').isLength({min:5}) ]
  , 
  (req, res, next)=>{
  let {username, email, password, passwordMatch} = req.body 
  console.log(username, email, password, passwordMatch)

  // form data validation
  const errors = validationResult(req); 
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.render('register', {title:'registration failed'});
  }

  // query starts here
  const connection = require('../db.js') 
  let query = `INSERT INTO users (username, email, password) VALUES (?,?,?)` 
  connection.query(query, [username, email, password], (err, results, fields)=>{
    if(err) throw err; 
    res.render('register', { title: 'registration completed' }); 
  }) 
});

module.exports = router;
