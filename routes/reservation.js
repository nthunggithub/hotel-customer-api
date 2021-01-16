var express = require('express');
var router = express.Router();

const ResersvationController = require("../controllers/reservation.controller");
const passport = require("passport");

router.post(
  "/api/createreservation",
  // passport.authenticate('jwt', { session: false }),
  ResersvationController.createReservation
)

module.exports = router;
