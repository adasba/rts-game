
var gameRoom = new GameRoom();

setTimeout(function () {
    var o = gameRoom.o;

    for (var i = 0; 144 > i; i++) {
        rtsGame.createGameObject(gameRoom, "SimpleSpaceship", Math.random() * 2000, Math.random() * 1000 + 1000, 2);
    }
    for (var i = 0; 24 > i; i++) {
        rtsGame.createGameObject(gameRoom, "SimpleTower", Math.random() * 400, Math.random() * 400, 1);
        //o[o.length - 1].hp = Math.random() * 300;
    }

    for (var i = 0; 9 > i; i++) {
        rtsGame.createGameObject(gameRoom, "EnergySpaceship", Math.random() * 2000, Math.random() * 1000 + 1500, 2);
        o[o.length - 1].targeting = "weakestEnergy";
    }
    for (var i = 0; 9 > i; i++) {
        rtsGame.createGameObject(gameRoom, "EnergyTower", Math.random() * 2000, Math.random() * 1000 + 1500, 2);
        o[o.length - 1].targeting = "weakestEnergy";
    }
    for (var i = 0; 4 > i; i++) {
        rtsGame.createGameObject(gameRoom, "ControlTower", Math.random() * 2000, Math.random() * 1000 + 1500, 2);
    }
    for (var i = 0; 9 > i; i++) {
        rtsGame.createGameObject(gameRoom, "EnergySpaceship", Math.random() * 400, Math.random() * 400, 1);
        o[o.length - 1].targeting = "weakestEnergy";
    }

    // for (var i = 0; 5 > i; i++) {
    //     rtsGame.createGameObject("Asteroid",  Math.random() * 2000, Math.random() * 1000 + 3000, 1));
    // }
}, 500);

function roomLoop() {
    
    gameRoom.gameLoop();
    requestAnimationFrame(roomLoop);
}
roomLoop();