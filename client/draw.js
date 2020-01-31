var drawUtils = {
    circle: function(ctx, obj) {
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.r, 0, TAU);
        ctx.fill();
        ctx.stroke();
    },
    rect: function(ctx, obj) {
        ctx.beginPath();
        ctx.rect(obj.x, obj.y, obj.w, obj.h);
        ctx.fill();
        ctx.stroke();
    },
    path: function(ctx, obj) {
        ctx.beginPath();
        for (var i = 0; obj.pts.length > i; i++) {
            var e = obj.pts[i];
            ctx.lineTo(e.x, e.y);
        }
        ctx.closePath();
        if (!obj.empty) ctx.fill();
        ctx.stroke();
    },
    drawFunc: function (ctx, obj) {
    	obj.f(ctx);
    },
    drawBars: function (ctx, obj) {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        if (!obj.nonCombatTarget) {
        	ctx.strokeStyle = drawUtils.colorScheme.overlay;
        	ctx.beginPath();
            ctx.arc(0, 0, (obj.collide.rad * 2) || 20, 0, TAU * (obj.hp / obj.maxHP));
            ctx.stroke();
        	ctx.strokeStyle = drawUtils.colorScheme.energy;
            ctx.beginPath();
            ctx.arc(0, 0, (obj.collide.rad * 2 + 5) || 25, 0, TAU * (obj.energy / obj.maxEnergy));
            ctx.stroke();
        	ctx.strokeStyle = drawUtils.colorScheme.stroke;
        }
        ctx.restore();
    },
    draw: function(ctx, obj) {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.direction);
        ctx.fillStyle = drawUtils.colorScheme.teams[obj.team];
        for (var i = 0; draws[obj.type].length > i; i++) {
            var e = draws[obj.type][i];
            drawUtils[e.type](ctx, e);
        }
        ctx.restore();
    },
    variableDraw: function(ctx, obj) {
        ctx.save();
        ctx.fillStyle = drawUtils.colorScheme.teams[obj.team];
        for (var i = 0; obj.variableDraw.strokes.length > i; i++) {
            var e = obj.variableDraw.strokes[i];
            if (e.color) ctx.strokeStyle = drawUtils.colorScheme[e.color];
            drawUtils[e.type](ctx, e);
        }
        ctx.restore();
    },
    colorScheme: {
        fill: "#EEEEEE",
        stroke: "#333333",
        overlay: "#BBBBBB",
        energy: "#DDDDDD",
        teams: ["#EEEEEE", "#666666"]
    },
    setColors: function(ctx) {
        ctx.strokeStyle = drawUtils.colorScheme.stroke;
        ctx.fillStyle = drawUtils.colorScheme.fill;
    },
}