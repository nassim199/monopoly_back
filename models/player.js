const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// module.exports = class Player {
//     constructor(name, piece_name) {
//         this.name = name;
//         this.piece_name = piece_name;
//         this.game = new Game(1500);
//     }
// }

playerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    piece_name: {
        type: String,
        required: true,
        default: 'piece'
    },
    game: {
        type: Schema.Types.ObjectId,
        ref: 'Game'
    }
})

module.exports = mongoose.model('Player', playerSchema);