const Room = require("../models/room");

const initialData = require("../models/initialBoxesData");

io = require('../socket');

/* game creation */

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

  await Room.findByIdAndDelete(roomId);

  res.status(201).json({
    message: "delete successful"
  });
}

/* game playing */

blockTurn = (room) => {
  room.playTurn -= 10;
};
resumeTurn = (room) => {
  room.playTurn += 10
};
nextTurn = (room) => {
  // Note : room.players.length is temporary before setting up bot players
  room.playTurn = (room.playTurn + 1) %  room.players.length;
}

transferMoney = (game1, game2, amount) => {
  game1.money += amount;
  game2.money -= amount;
}
addMoney = (game, amount) => {
  game.money += amount;
}
removeMoney = (game, amount) => {
  game.money -= amount;
}

stationPrice = (game) => {
  let price = 25;

  [5,15,25,35].forEach(i => {
    if (game.properties.includes(i)) {
      price *= 2;
    }
  });
  price = price / 2;
}
utilsPrice = (game, steps) => {
  //depending on dices
  return 10;
}

movePlayer = (game, steps, direction) => {
  if (direction == 'forward') {
    game.pos = game.pos + steps;
    while (game.pos >= 40) {
      addMoney(game, 200);
      game.pos -= 40;
    }
  } else if (direction == 'backward') {
    game.pos = game.pos - steps;
    while (game.pos < 0) {
      game.pos += 40;
    }
  } else {
    throw new Error("precise direction of moving")
  }

  return game;
}

goToPrison = (game) => {
  game.pos = 10;
  game.state = 'prison';
}

canBuild = (room, player) => {
  let pos = player.game.pos;
  let b = room.boxes[pos];
  let pData = initialData.propertiesData[pos];

  if (b.state > 5)
    return false;

  if (pData.type != 'Property-Ground')
    return false;

  if (player._id.toString() != b.owner.toString())
    return false;
  
  //to test later

  // let familyBoxes = room.boxes.filter((_, i) => initialData.propertiesData[i].color == pData.color);

  // for (let i = 0; i < familyBoxes.length; i++) {
  //   const box = familyBoxes[i];
  //   if (box.owner.toString() != b.owner.toString())
  //     return false;
    
  //   if (b.state > box.state)
  //     return false;
    
  // }

  return true;

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
    room.dice2 = Math.floor(Math.random() * (6) ) + 1;

    let p = room.players[room.playTurn];
    let steps = room.dice1 + room.dice2;

    p.game = movePlayer(p.game, steps, 'forward');

    room.players[room.playTurn] = p;

    
    let action;
    let b = room.boxes[p.game.pos];
    let pData = initialData.propertiesData[p.game.pos]

    switch (pData.type.split('-')[0]) {
      case 'Property':
        if (b.state == 0) {
          if (p.game.money >= pData.price) {
            action = 'buy';
            blockTurn(room);
          } else {
            //put to auction
          }
        } else {
          let p2 = room.players.find((p) => b.owner.toString() == p._id.toString());
          if (b.state != -1) {
            let price = 0;
            switch (pData.type.split('-')[1]) {
              case 'Ground':
                price = pData.prices[b.state];
                break;
              case 'Station':
                price = stationPrice(p2.game);            
                break;
              case 'Util':
                price = utilsPrice(p2.game, steps);
                break;
            }
            transferMoney(p2.game, p.game, price);
            await p2.game.save();
          }
        }
        break;
      case 'Taxe':
          let amount = (p.game.pos == 4) ? 200 : 100;
          removeMoney(p.game, amount);
        break;
      case 'Gotoprison':
        goToPrison(p.game);
        break;
      case 'Card':
        break;
    }

    if (!action) {
      if (room.dice1 != room.dice2) {
        p.game.state = 'free';
        nextTurn(room);
      } else {
        if (p.game.state == 'free--') {
          goToPrison(p.game);
          nextTurn(room);
        } else {
          p.game.state += '-';
        }
      }
    }


    await p.game.save();
    await room.save();

    io.getIO().to(roomId).emit('playRound', room);

    res.status(201).json({
      message: "turn played successfully",
      action: action
    })
  } catch (err) {
    console.log(err);
  }
}

exports.buy = async (req, res, next) => {
  try {
    let roomId = req.params.roomId;
    let b = req.body.buy;

    
    let room = await Room.findById(roomId).populate({
      path: 'players',
      populate: {
        path: 'game'
      }
    });
    
    resumeTurn(room);
    let p = room.players[room.playTurn];

    if (b) {

      room.boxes[p.game.pos].owner = p._id;
      room.boxes[p.game.pos].state = 1;
      p.game.properties.push(p.game.pos);
      p.game.money -= initialData.propertiesData[p.game.pos].price;

      await p.game.save();
    }

    nextTurn(room);

    await room.save();

    io.getIO().to(roomId).emit('playRound', room);

    res.status(201).json({
      message: "propertie bought",
      property: p.game.pos
    })

  } catch (err) {
    console.log(err);
  }
}

exports.build = async (req, res, next) => {
  try {
    let roomId = req.params.roomId;

    let room = await Room.findById(roomId).populate({
      path: 'players',
      populate: {
        path: 'game'
      }
    });

    let p = room.players[room.playTurn];
    let build = false;

    if (canBuild(room, p)) {
      room.boxes[p.game.pos].state += 1;
      build = true;
    }

    await room.save();

    io.getIO().to(roomId).emit('playRound', room);

    res.status(201).json({
      message: "build request succ",
      build: build
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