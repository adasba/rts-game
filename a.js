//init.js
const TAU = Math.PI * 2;



//gameUtil.js
var gameUtil = {
    pointTo: function(obj, target) {
        return Math.atan2(target.y - obj.y, target.x - obj.x);
    },
    dist: function(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    },
    distTo: function(obj, target) {
        return gameUtil.dist(obj.x, obj.y, target.x, target.y);
    },
    nearest: function(obj, all, filter) {
        var minDist = Infinity;
        var minDistIndex = 0;
        for (var i = 0; all.length > i; i++) {
            var e = all[i];
			var dist = gameUtil.distTo(obj, e);
			
            if (dist < minDist && dist != 0 && filter(e)) {
                minDist = dist;
                minDistIndex = i;
            }
        }
        return all[minDistIndex];
    },
    moveTo: function(obj, target) {
        var dir = gameUtil.pointTo(obj, target);
		obj.direction = dir;
        var dist = gameUtil.distTo(obj, target);
        if (dist > obj.moveTo.range) {
            obj.dx += obj.moveTo.vel * Math.cos(dir);
            obj.dy += obj.moveTo.vel * Math.sin(dir);
        } else if (dist < obj.moveTo.range - 10) {
            obj.dx -= obj.moveTo.vel * Math.cos(dir);
            obj.dy -= obj.moveTo.vel * Math.sin(dir);
        }
    },
    applyPhysics: function(obj) {
        obj.x += obj.dx;
        obj.y += obj.dy;
        obj.dx *= obj.drag;
        obj.dy *= obj.drag;
        obj.direction = Math.atan2(obj.dy, obj.dx);
    },
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
        ctx.fill();
        ctx.stroke();
    },
    draw: function(ctx, obj) {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.direction);
        for (var i = 0; obj.draw.strokes.length > i; i++) {
            var e = obj.draw.strokes[i];
            gameUtil[e.type](ctx, e);
        }
        ctx.restore();
    },
    colorScheme: {
        fill: "#EEEEEE",
        stroke: "#333333"
    },
    setColors: function(ctx) {
        ctx.strokeStyle = gameUtil.colorScheme.stroke;
        ctx.fillStyle = gameUtil.colorScheme.fill;
    }
};

var rtsGame = {
    gameObject: function(type, x, y, team) {
        var obj = {};
        obj.type = type;
        obj.x = x;
        obj.y = y;
        obj.team = team;
        obj.dx = 0;
        obj.dy = 0;
        obj.direction = 0;
        obj.draw = {};
        obj.draw.strokes = draws[obj.type];
        for (var x in gameObjectParams[obj.type]) {
            obj[x] = gameObjectParams[obj.type][x];
        }
        obj.hp = obj.maxPp;
        obj.energy = 0;
        obj.drag = obj.drag || 0.95;
        return obj;
    }
}



//gameObjectData.js
var draws = {
    SimpleSpaceship: [{
		type: "path",
        pts: [{
                x: -10,
                y: -10
            },
            {
                x: -10,
                y: 10
            },
            {
                x: 10,
                y: 0
            }
        ]
    }]
};

var gameObjectParams = {
    SimpleSpaceship: {
        maxEnergy: 100,
        maxHP: 100,
        fireDelay: 40,
        updateFunction: function(others) {
            gameUtil.moveTo(this, gameUtil.nearest(this, others, e => { return this.team != e.team }));
			gameUtil.applyPhysics(this);
        },
        moveTo: {
            range: 30,
			vel: 0.3
        }
    }
}

var c = document.getElementById("canvas");
var canvasContext = c.getContext("2d");

//loop.js
var o = [];
for (var i = 0; 10 > i; i++) {
    o.push(rtsGame.gameObject("SimpleSpaceship", Math.random() * 100 + Math.floor(i / 5) * 300, Math.random() * 400, Math.floor(Math.random() * 2)));
}

function loop() {
    gameUtil.setColors(canvasContext);

    canvasContext.clearRect(0, 0, c.width, c.height);

    for (var i = 0; o.length > i; i++) {
        o[i].updateFunction(o);
        gameUtil.draw(canvasContext, o[i]);

    }

    requestAnimationFrame(loop);
}
loop();
