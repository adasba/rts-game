function gameLoop(room) {
    //console.log(room.o.length);
    var len =  room.o.length;

    for (var i = 0; len > i; i++) {
        room.o[i].updateFunction(room);
    }
    
    for (var i = 0; room.o.length > i; i++) {
    	if (room.o[i].dead || room.o[i].hp <= 0) {
        	room.o.splice(i, 1);
            i--;
        }
    }

    serverToClient(room);
}
//gameLoop();