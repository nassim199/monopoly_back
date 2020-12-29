const express = require('express');
//const { body } = require('express-validator/check');

const gameController = require('../controllers/game');

const router = express.Router();

router.get('/game', gameController.createRoom);

module.exports = router;