var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session')
var bcrypt = require('bcrypt')

var index = require('./routes/index');
var users = require('./routes/users');


var app = express(); 
require('dotenv').config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// apply bodyParser
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// initialize MySQLStore
const db = require('./db.js')
let MySQLStore = require('express-mysql-session')(session);
let options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database : process.env.DB_NAME
}
var sessionStore = new MySQLStore(options);


// require and init express-session
app.use(session({ 
  secret: 'keyboard cat',
  resave: false, 
  store: sessionStore,
  saveUninitialized:false,
  cookie: { maxAge: 6000* 60*24 }
}))


// init passport
var passport = require('passport')
app.use(passport.initialize());
app.use(passport.session());


// deliver user authentication status to template
app.use((req, res, next)=>{
  res.locals.isAuthenticated = req.isAuthenticated()
  next() 
  }
)


// define passport authentication strategy(logic) 
var LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(
  function(username, password, done) {

    // query database with provided username
    db.query('SELECT id, password FROM users where username=? ', [username],(err, results, fields)=>{

      // error handling with passport done()
      if(err) {
        throw done(err)
      }
      else if(results.length === 0){
        return done(null, false, {message: 'user not exist'}) 
      }
      else{ 

        // compare user provided password with hashed password (query result) with bcrypt module
        // due to mysql password field type (binary), 
        // results[0].password should be decoded with toString()
        let hashedPassword = results[0].password.toString('utf-8') 

        bcrypt.compare(password, hashedPassword, (error, result)=>{ 
          // password match, enter user login process
          if(result) { 
            let id = parseInt(results[0].id )

            console.log( 'id:', id)

            // call done to pass userData to req.login, which will be called automatically after passport.authenticate()  and finally finish login process
            // the userData receive by done() should be of same structure as the one req.login() receive
            // during register process
            return done(null, {user_id:id})
          }
          else{ 
            return done(null, false) 
          }
        }) 
      }
    })
  })
)


// define static resources folder 
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Handlebars default config
const hbs = require('hbs');
const fs = require('fs');

const partialsDir = __dirname + '/views/partials';

const filenames = fs.readdirSync(partialsDir);

filenames.forEach(function (filename) {
  const matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  const name = matches[1];
  const template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  hbs.registerPartial(name, template);
});

hbs.registerHelper('json', function(context) {
  return JSON.stringify(context, null, 2);
});


module.exports = app;
