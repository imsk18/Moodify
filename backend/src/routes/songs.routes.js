const express = require("express");
const upload = require("../middleware/upload.middleware");
const songsController = require("../controllers/songs.controller");

const router = express.Router();

//api/songs
router.post("/",upload.single("song"),songsController.uploadSong);
router.get("/",songsController.getSong);   //grt(/:mood) also can do

module.exports = router