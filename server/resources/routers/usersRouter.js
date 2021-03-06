var express = require('express');
var passport = require('passport');
var passportjs = require('../../config/passport.js')(passport);

var Validator = require('validator');
var isempty = require('lodash/isEmpty');
var usersRouter = express.Router();
var usersController = require('../controllers/usersController');

usersRouter.use(passport.initialize());

usersRouter.route('/')
  .get(usersController.getUser)
  .post(usersController.createUser)
  .put(usersController.updateUser)
  .delete(usersController.deleteUser)

usersRouter.route('/id')
  .get(usersController.getId)


  //facebook oauth routes
  // usersRouter.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}))
  // usersRouter.get('/auth/facebook/callback',
  // 	passport.authenticate('facebook'), usersController.oauthSuccess); //
usersRouter.route('/facebook')
.get( passport.authenticate('facebook', {scope: ['email']}))
usersRouter.route('/facebook/callback')
.get(passport.authenticate('facebook'), usersController.oauthSuccess); //

  /////////////////////////////////////
module.exports = usersRouter;

