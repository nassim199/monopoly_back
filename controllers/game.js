const Room = require("../models/room");

const initialData = require("../models/initialBoxesData");

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

    let room = new Room({
      numberPlayers: numberPlayers,
      boxes: initialData.initialData
    });

    let play = await room.addPlayer(playerId);

    res.status(201).json({
        message: 'room created succesfully',
        roomId: room._id,
        game: play.game
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

    let play = await room.addPlayer(playerId);


    res.status(201).json({
        message: 'joined game succesfully',
        game: play.game
    });

    io.getIO().to(roomId).emit('joinedRoom', play.player);

  } catch (err) {
    console.log(err);
  }
}

exports.leaveRoom = async (req, res, next) => {
  try {
    let roomId = req.params.roomId;

    let playerId = req.body.playerId;

    let room = await Room.findById(roomId);

    let p = await room.removePlayer(playerId);

    io.getIO().emit('leftRoom', p);

    res.status(201).json({
      message: "player deleted successfully"
    })

  } catch (err) {

  }
}

exports.enterRoom = async (req, res, next) => {
  try {
    let roomId = req.params.roomId;

    // Note : if it was a request from waiting room no need to populate game and boxes

    let room = await Room.findById(roomId).populate({
      path: 'players',
      populate: {
        path: 'game'
      }
    });
  
    res.status(201).json(room);

  } catch (err) {
    console.log(err);
  }
}

exports.deleteRoom = async (req, res, next) => {
  let roomId = req.params.roomId;
  let room = await Room.findById(roomId);

  await room.boxes.forEach(async (b) => {
    await Box.findByIdAndDelete(b);
  });

  await Room.findByIdAndDelete(roomId);

  res.status(201).json({
    message: "delete successful"
  });
}

exports.playRound = async (req, res, next) => {
  try {
    let roomId = req.params.roomId;

    let room = await Room.findById(roomId).populate({
      path: 'players',
      populate: {
        path: 'game'
      }
    });

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

    // Note : temporary before setting bot - room.numberPlayers;
    room.playTurn = (room.playTurn + 1) %  room.players.length;

    await p.game.save();
    await room.save();

    io.getIO().to(roomId).emit('playRound', room);

    //room.boxes[p.game.pos-1].landsOn(room, p);

    res.status(201).json({
      message: "turn played successfully",
    })
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
  
  io.getIO().to(roomId).emit('chatMessage', { newMessage: message });

  res.status(201).json({
    message: 'message sent successfully'
  })

  } catch (err) {
    console.log(err);
  }
}