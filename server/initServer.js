//init.js
const TAU = Math.PI * 2;

var allServerData = [];

function GameRoom() {
    this.o = [];
    this.players = [];
    this.currentID = 0;
    this.incomingData = [];
    this.gameLoop = function () {
        //console.log("test");
        this.updatePlayers();
        gameLoop(this);
    }
    this.uuidPresent = function (uuid) {
        for (var i = 0; this.players.length > i; i++) {
            if (this.players[i].uuid == uuid) {
                return true;
            }
        }
        return false;
    }
    this.updatePlayers = function () {
        for (var i = 0; this.incomingData.length > i; i++) {
            if (this.players[i] && this.uuidPresent(this.incomingData[i].uuid)) {
                this.players[i] = this.incomingData[i];
                this.incomingData.splice(i, 1);
                i--;
            } else {
                this.players.push(this.incomingData[i]);
                this.incomingData.splice(i, 1);
                console.log("a");
                i--;
            }
        }
    }
}
