const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const passport = require('passport')

const { check, validationResult } = require('express-validator/check');

/* GET home page. */
router.get('/', (req, res, next) => {
  console.log("req.session.passport:", req.session.passport)
  console.log("req.session:", req.session)
  console.log("req.user:", req.user)
  console.log("req.isAuthenticated():", req.isAuthenticated())
  res.render('home', { title: 'Homepage' });
});

/* GET profile page. */
router.get('/profile', authenticationMiddleware(), (req, res, next) => {

  // get userdata from database
  const db = require('../db.js')

  db.query('SELECT username, email FROM users where id=?', [req.user.user_id], (err, results, fields) => {
    if (err) throw err;
    else {
      username = results[0].username 
      email = results[0].email 

      res.render('profile', { username: username, email: email })
    }
  })
})


/* GET login page. */
router.get('/login', (req, res, next) => {
  res.render('login', { title: 'Login' })
})


/* POST login page. */
router.post('/login',
  passport.authenticate(
    'local', {
      successRedirect: '/profile',
      failureRedirect: '/login'
    }
  )
)

/* GET Logot page. */
router.get('/logout', (req, res, next) => {
  // user passport req.logout to delete session
  req.logout()

  res.clearCookie('connect.sid', { path: '/' });
  req.session.destroy((err) => {
    if (err) throw err
    res.redirect('/')
  })
})


/* GET register page. */
router.get('/register', (req, res, next) => {
  res.render('register', { title: 'Registration' });
});


/* POST register user */
router.post(
  '/register',
  [
    check('username', 'username must be between 8-16 characters').isLength({ min: 8, max: 16 }),
    check('email').isEmail().withMessage('please input a valid email'),
    check('email').isLength({ min: 8, max: 100 }).withMessage('email must be between 8-100 characters'),
    check('password').isLength({ min: 8, max: 100 }).withMessage('password should be at lease 8 characters').custom((value, { req, loc, path }) => {
      if (value !== req.body.passwordMatch) {
        // trow error if passwords do not match
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    })
  ]
  ,
  (req, res, next) => {
    let { username, email, password, passwordMatch } = req.body
    console.log(username, email, password, passwordMatch)

    // get form data validation result
    const errors = validationResult(req);
    validationErrors = errors.array()
    if (!errors.isEmpty()) {
      console.log(validationErrors)
      return res.render('register', { title: 'registration failed', errors: validationErrors })
    }

    else {
      const db = require('../db.js')

      // hash user password
      const saltRounds = 10
      bcrypt.hash(password, saltRounds, (err, hashResult) => {

        // create user in database
        let query = `INSERT INTO users (username, email, password) VALUES (?,?,?)`
        db.query(query, [username, email, hashResult], (err, results, fields) => {
          if (err) {
            // generate sqlError while error happen during the query

            sqlErrors = []
            console.log('error happen during query:', err);
            let message = err.sqlMessage
              sqlErrors.push({msg: '创建用户失败'}) 
            if(message.indexOf('username') >0){
              sqlErrors.push({msg: '该用户名已被占用'})
            }
            if(message.indexOf('email') >0)
            { sqlErrors.push({msg: '该邮箱已被占用'}) 
            } 
            res.render('register', { title: 'registration failed' , errors: sqlErrors});
          }
          else {
            // login user after registration
            db.query('SELECT LAST_INSERT_ID() as user_id', (err, results, fields) => {
              if (err) throw err;

              let user_id = results[0]
              console.log('user_id:', user_id)

              // use passport req.login to log in user with user_id as session
              req.login(user_id, (err) => {
                // redirect to homepage after login
                res.redirect('/')
              })
            })
          }
        })
      })
    }
  });


// serialize before store session
passport.serializeUser(function (user, done) {
  done(null, user);
});

// deserialize before read from session
passport.deserializeUser(function (user, done) {
  done(null, user);
});

// define a middleware to authenticate user
function authenticationMiddleware() {
  return (req, res, next) => {
    // if user is authenticated (logged-in), then jump to next middleware
    if (req.isAuthenticated()) return next();

    // else jump to login page
    res.redirect('login')
  }
}

module.exports = router;
