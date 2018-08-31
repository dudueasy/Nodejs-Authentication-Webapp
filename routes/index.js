const express = require('express');
const router = express.Router(); 
const bcrypt = require('bcrypt')

const { check, body, validationResult } = require('express-validator/check');

/* GET home page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'registration' });
});

router.post(
  '/register', 
  [
    check('username','username must be between 8-16 characters').isLength({min: 8, max: 16}), 
    check('email').isEmail().withMessage('please input a valid email'),
    check('email').isLength({min:8, max:100}).withMessage('email must be between 8-100 characters'),
    check('password').isLength({min:5, max:100}).withMessage('password should be at lease 5 characters').custom((value,{req, loc, path}) => {
      if (value !== req.body.passwordMatch) {
        // trow error if passwords do not match
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    })
  ]
  , 
  (req, res, next)=>{
    let {username, email, password, passwordMatch} = req.body 
    console.log(username, email, password, passwordMatch)

    // get form data validation result
    const errors = validationResult(req); 
    validationErrors = errors.array()
    if (!errors.isEmpty()) { 
      return res.render('register', {title:'registration failed', errors: validationErrors})
    }   

    else{
      // hash user password
      const connection = require('../db.js') 

      const saltRounds = 10
      bcrypt.hash(password, saltRounds, ()=>{

        // query starts here
        let query = `INSERT INTO users (username, email, password) VALUES (?,?,?)` 
        connection.query(query, [username, email, password], (err, results, fields)=>{
          if(err) { 
            console.log('error happen during query:',err); 
            res.render('register', { title: 'registration failed' }); 
          } 
          res.render('register', { title: 'registration completed' }); 
        }) 
      }) 
    }
  });

module.exports = router;
