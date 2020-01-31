


var player = new PlayerClient(2, "singleplayer");



function clientLoop() {
    var o = allClientData.objects;

    player.mouseSelect(o, mouse, keys);

    //handle scaling
    scale.factor = Math.pow(2, scale.log);

    scale.d -= Math.sign(mouse.w) / 60;

    scale.log += scale.d;
    scale.d *= 0.9;

    canvasContext.lineWidth = 3;
    canvasContext.lineJoin = "round";
    canvasContext.lineCap = "round";

    drawUtils.setColors(canvasContext);

    canvasContext.clearRect(0, 0, c.width, c.height);

    canvasContext.save();
    canvasContext.translate(window.innerWidth / 2, window.innerHeight / 2);
    canvasContext.scale(scale.factor, scale.factor);
    canvasContext.translate(-window.innerWidth / 2, -window.innerHeight / 2);
    canvasContext.translate(-pos.x, -pos.y);
    
    for (var i = 0; o.length > i; i++) {
        drawUtils.drawBars(canvasContext, o[i]);
    }


    var drawCount = 1;
    var currentLayer = 0;
    while (drawCount != 0) {
    	drawCount = 0;
        for (var i = 0; o.length > i; i++) {
          	if (o[i].draw.layer >= currentLayer) {
            	drawCount++;
                if (o[i].draw.layer == currentLayer) {
        			drawUtils.variableDraw(canvasContext, o[i]);
                }
            }
        }
        currentLayer++;
    }

    drawCount = 1;
    currentLayer = 0;
    while (drawCount != 0) {
    	drawCount = 0;
        for (var i = 0; o.length > i; i++) {
          	if (o[i].draw.layer >= currentLayer) {
            	drawCount++;
                if (o[i].draw.layer == currentLayer) {
        			drawUtils.draw(canvasContext, o[i]);
                }
            }
        }
        currentLayer++;
    }
    player.displaySelection(canvasContext);
    canvasContext.strokeStyle = drawUtils.colorScheme.overlay;

    canvasContext.restore();

    mouse.w = 0;

    keys.kd = {};

    clientToServer(
        {
            x: pos.x,
            y: pos.y,
            w: window.innerWidth / scale.factor,
            h: window.innerHeight / scale.factor,
            orders: player.orders
        }
    );

    player.orders = [];

    requestAnimationFrame(clientLoop);
}
clientLoop();