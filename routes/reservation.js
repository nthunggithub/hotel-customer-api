var express = require('express');
var router = express.Router();

const ResersvationController = require("../controllers/reservation.controller");
const passport = require("passport");

router.post(
  "/api/createreservation",
  // passport.authenticate('jwt', { session: false }),
  ResersvationController.createReservation
)

router.post(
  "/api/updateBills",
  // passport.authenticate('jwt', { session: false }),
  ResersvationController.updateBills
)

module.exports = router;
