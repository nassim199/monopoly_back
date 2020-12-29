module.exports = class Player {
    constructor(name, piece_name) {
        this.name = name;
        this.piece_name = piece_name;
        this.game = {
            pos: 1,
        };
    }
}