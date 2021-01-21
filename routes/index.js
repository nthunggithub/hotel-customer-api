var express = require('express');
var router = express.Router();
const hotelController = require("../controllers/hotel.controller")
const passport = require("passport");
/* GET home page. */

router.get("/getListRoom", hotelController.getListRoom);
router.post("/searchRoom", hotelController.searchRoom);
router.get("/getRoomInfo/:roomId", hotelController.getRoomInfo);
router.post("/postcomment", hotelController.postcomment);
router.get("/getcommentlist/:id", hotelController.getcommentlist);
router.get("/getbills/", passport.authenticate('jwt', { session: false }), hotelController.getbills);//get phieu dat phong
module.exports = router;
