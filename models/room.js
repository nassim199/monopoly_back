const mongoose = require('mongoose');

const Schema = mongoose.Schema;

Box = require('./box');
Game = require('./game');
Player = require('./player');

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
    boxes:[{
        type: Schema.Types.ObjectId,
        ref: 'Box',
        required: true
        }],
    playTurn: {
        type: Number,
        default: 0
    },
    chat: {
        type: [String], 
        default:[]
    }
})

roomSchema.methods.addPlayer = function(playerId) {

    let g = new Game();
    let player;

    return g.save().then(() => {
        return Player.findById(playerId);
    }).then((p) => {
        player = p;
        p.game = g._id;
        return p.save();
    }).then(() => {
        this.players.push(playerId);
        return this.save();
    }).then(() => { 
        return {
            game: g,
            player: player
        } 
    });

};

roomSchema.methods.removePlayer =  function(playerId) {
    let player;

    return Player.findById(playerId).then((p) => {
        player = p;
        return Game.findByIdAndDelete(p.game);
    }).then(() => {
        player.game = undefined;
        
        return player.save();
    }).then(() => {
        this.players = this.players.filter((p) => player._id.toString() != p._id.toString())

        return this.save();
    }).then(() => {
        return player;
    });
}

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