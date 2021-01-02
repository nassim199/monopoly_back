// const fs = require('fs');
// const path = require('path');

const room = require("../models/room");

// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   'data',
//   'rooms.json'
// );


Player = require("../models/player");
Room = require("../models/room");
Game = require("../models/game");
Box = require("../models/box");

io = require('../socket');

exports.getRooms = async (req, res, next) => {
  try {
    let rooms = await Room.find();

    res.status(201).json({
      message: 'get all rooms successful',
      rooms: rooms,
    });
  } catch (err) {
    console.log(err);
  }
}

exports.createRoom = async (req, res, next) => {

  try {
    let playerId = req.body.playerId;
    let numberPlayers = req.body.numberPlayers;

    let boxes = Array(40).fill().map((_, i) => new Box({pos: i+1}))
    
    for (let i = 0; i < boxes.length; i++) {
      await boxes[i].save();
    }

    let room = new Room({
      numberPlayers: numberPlayers,
      boxes: boxes
    });

    //await room.save();
    
    let g1 = new Game();

    await g1.save();

    let p1 = await Player.findById(playerId);
    p1.game = g1._id;


    await p1.save();


    await room.addPlayer(p1);

    res.status(201).json({
        message: 'room created succesfully',
        roomId: room._id,
        game: g1
    });

  } catch (err) {
    console.log(err);
  }
}

exports.joinRoom = async (req, res, next) => {
  try {
    let playerId = req.body.playerId;
    let roomId = req.params.roomId;
    let room = await Room.findById(roomId);

    let g3 = new Game();

    await g3.save();

    let p3 = await Player.findById(playerId);
    p3.game = g3._id;


    await p3.save();


    await room.addPlayer(p3._id);


    res.status(201).json({
        message: 'joined game succesfully',
        game: g3
    });

  } catch (err) {
    console.log(err);
  }
}

exports.enterRoom = async (req, res, next) => {
  try {
    let roomId = req.params.roomId;

    let room = await Room.findById(roomId).populate({
      path: 'players',
      populate: {
        path: 'game'
      }
    }).populate('boxes');
  
    res.status(201).json(room);
  } catch (err) {
    console.log(err);
  }
}

exports.playRound = async (req, res, next) => {
  try {
    let roomId = req.params.roomId;

    let room = await Room.findById(roomId).populate({
      path: 'players',
      populate: {
        path: 'game'
      }
    }).populate('boxes');

    room.dice1 = Math.floor(Math.random() * (6) ) + 1;
    room.dice1 = Math.floor(Math.random() * (6) ) + 1;

    let p = room.players[room.playTurn];
    let dice = room.dice1 + room.dice2;

    while (dice > 0) {
        p.game.pos++;
        if (p.game.pos > 40) p.game.pos = 1;

        //room.boxes[p.game.pos-1].stepsBy(room, p);
        dice--;
    }

    room.players[room.playTurn] = p;

    room.playTurn = (room.playTurn + 1) % room.numberPlayers;

    await p.game.save();
    await room.save();
    //res.status(201).json(room);
    io.getIO().to(room._id.toString()).emit('playRound', room);
    //room.boxes[p.game.pos-1].landsOn(room, p);
  } catch (err) {
    console.log(err);
  }
}

exports.sendMessage = async (req, res, next) => {
  try {
  let roomId = req.params.roomId;

  let room = await Room.findById(roomId);

  let message = req.body.message;

  room.chat.push(message);

  await room.save();
  
  io.getIO().to(room._id.toString()).emit('chatMessage', { newMessage: message });

  } catch (err) {
    console.log(err);
  }
}