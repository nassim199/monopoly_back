const express = require('express');
//const { body } = require('express-validator/check');

const gameController = require('../controllers/game');

const router = express.Router();

router.get('/', gameController.getRooms);

router.post('/', gameController.createRoom);

router.post('/:roomId', gameController.joinRoom);

router.get('/:roomId', gameController.enterRoom);

router.post('/:roomId/leaveRoom', gameController.leaveRoom);

router.post('/:roomId/deleteRoom', gameController.deleteRoom);

router.post('/:roomId/playRound', gameController.playRound);

router.post('/:roomId/buy', gameController.buy);

router.post('/:roomId/build', gameController.build);

router.post('/:roomId/chat', gameController.sendMessage);


module.exports = router;