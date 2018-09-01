const express = require('express');
const router = express.Router(); 
const bcrypt = require('bcrypt')
const passport = require('passport')

const { check, validationResult } = require('express-validator/check');

/* GET home page. */ 
router.get('/', function(req, res, next) { 

  console.log("req.user:", req.user)
  console.log("req.isAuthenticated():", req.isAuthenticated())
  res.render('home', { title: 'Homepage' });
});


/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'registration' });
});


/* post register user */
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
      const db = require('../db.js') 

      // hash user password
      const saltRounds = 10
      bcrypt.hash(password, saltRounds, (err, hashResult)=>{

        // create user in database
        let query = `INSERT INTO users (username, email, password) VALUES (?,?,?)` 
        db.query(query, [username, email, hashResult], (err, results, fields)=>{
          if(err) { 
            console.log('error happen during query:',err); 
            res.render('register', { title: 'registration failed' }); 
          } 

          // login user after registration
          db.query('SELECT LAST_INSERT_ID() as user_id', (err, results, fields)=>{
            if(err) throw err;

            let user_id = results[0]
            console.log(user_id) 
             
            req.login(user_id, (err) =>{
              // redirect to homepage after login
              res.redirect('/')
            })
          }) 
          // res.render('register', { title: 'registration completed' }); 
        }) 
      }) 
    }
  });


// serialize before store session
passport.serializeUser(function(user, done) {
  done(null, user);
});

// deserialize before read from session
passport.deserializeUser(function(user, done) {
  done( null,user);
});

module.exports = router;
