function gameLoop(room) {
    //console.log(room.o.length);
    var len =  room.o.length;

    for (var i = 0; room.players.length > i; i++) {
        for (var j = 0; room.players[i].orders.length > j; j++) {
            var e = room.players[i].orders[j];
            var obj = false;
            for (var k = 0; len > k; k++) {
                obj = room.o[k];
                if (e.id == obj.id) {
                    if (e.type == "move" || e.type == "stop") {
                        obj.orders.push(e);
                        k = len + 1;
                    } else if (e.type == "changeProperty") {
                        console.log(e.prop);
                        if (rtsGame.clientSafePropList.indexOf(e.prop) != -1) {
                            obj[e.prop] = e.value;
                        }
                        k = len + 1;
                    }
                }
            }
        }
        room.players[i].orders = [];
    }

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