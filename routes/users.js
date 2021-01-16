var express = require('express');
var router = express.Router();

const { authJwt } = require("../middleware");

const controllerAuth = require("../controllers/auth.controller");
const passport = require("passport");

router.get(
  "/api/getUser",
  passport.authenticate('jwt', { session: false }),
  controllerAuth.getUser
)


module.exports = router;
