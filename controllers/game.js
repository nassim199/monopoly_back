Player = require("../models/player");
Room = require("../models/room");

exports.createRoom = (req, res, next) => {
    let room = new Room(1);
    
    let p1 = new Player('player a', 'boat');
    let p2 = new Player('player b', 'hat');
    let p3 = new Player('player c', 'piece');

    room.addPlayer(p1);
    room.addPlayer(p2);
    room.addPlayer(p3);

    res.status(201).json(room);
}