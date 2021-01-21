var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const authRouter = require('./routes/auth.routes');
const reservationRouter = require('./routes/reservation');
//passport
const jwt = require("jsonwebtoken");
var passport = require('passport');
var passportJWT = require('passport-jwt');
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var jwtOptions = {};
const { query } = require("./models/querydb");

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'hcmus-secret-key';

// lets create our strategy for web token
var strategy = new JwtStrategy(jwtOptions, async function (jwt_payload, next) {
  try {
    console.log('payload received', jwt_payload);
    // var user = getUser({ id: jwt_payload.id });
    let user = await query(`select * from taikhoan as tk, khachang as kh where tk.MaTK = ${jwt_payload.id} and tk.TrangThai = ${1} and tk.MaTK = kh.MaTK`);
    if (user.length) {
      //req.user = user[0];
      next(null, user[0]);
    } else {
      next(null, false);
    }
  } catch (error) {
    console.log(error)
  }
});
// use the strategy
passport.use(strategy);

var app = express();

app.use(cors())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', authRouter);
app.use('/', reservationRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
