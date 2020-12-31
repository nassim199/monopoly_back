const mongoose = require('mongoose');

const Schema = mongoose.Schema;

Box = require('./box');

const roomSchema = new Schema({
    numberPlayers: {
        type: Number,
        required: true
    },
    dice1: {
        type: Number,
        default: 1
    },
    dice2: {
        type: Number,
        default: 1
    },
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'Player'
    }],
    boxes: [{
        type: Schema.Types.ObjectId,
        ref: 'Box',
        required: true
    }],
    playTurn: {
        type: Number,
        default: 0
    }
})

roomSchema.methods.addPlayer = function(playerId) {
    this.players.push(playerId);

    return this.save();
};

module.exports = mongoose.model('Room', roomSchema);


// module.exports = class Room {
//     constructor(numberPlayers) {
//         this.id = 1;
//         this.numberPlayers = numberPlayers;

//         this.dice1 = 1;
//         this.dice2 = 2;
//         this.players = [];
//         this.boxes = Array(40).fill().map((_, i) => new Box(i+1));
//         this.playerTurn = 0;
//     }

//     addPlayer(p) {
//         this.players.push(p);
//     }

//     roomIsFull() {
//         return this.players.length == this.numberPlayers;
//     }
// }