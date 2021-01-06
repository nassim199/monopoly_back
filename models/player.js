const mongoose = require('mongoose');

const Schema = mongoose.Schema;

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