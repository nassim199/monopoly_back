module.exports = class Room {
    constructor(id) {
        this.id = id;
        this.dice1 = 1;
        this.dice2 = 2;
        this.players = [];
        this.boxes = Array(40).fill().map((_, i) => i+1);
        this.playerTurn = 0;
    }

    addPlayer(p) {
        this.players.push(p);
    }
}