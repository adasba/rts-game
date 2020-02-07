
var rtsGame = {
    pointTo: function(obj, target) {
        return Math.atan2(target.y - obj.y, target.x - obj.x);
    },
    pointToTarget: function (obj, target) {
    	obj.direction = rtsGame.pointTo(obj, target);
    },
    dist: function(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    },
    distTo: function(obj, target) {
        return rtsGame.dist(obj.x, obj.y, target.x, target.y);
    },
    nearest: function(obj, all, filter) {
        var minDist = Infinity;
        var minDistIndex = 0;
        for (var i = 0; all.length > i; i++) {
            var e = all[i];
			var dist = rtsGame.distTo(obj, e);
			
            if (dist < minDist && dist != 0 && filter(e)) {
                minDist = dist;
                minDistIndex = i;
            }
        }
        return all[minDistIndex];
    },
    moveTo: function(obj, target) {
        var dir = rtsGame.pointTo(obj, target);
        var dist = rtsGame.distTo(obj, target);
        if (dist > obj.moveTo.range) {
            obj.dx += obj.moveTo.vel * Math.cos(dir);
            obj.dy += obj.moveTo.vel * Math.sin(dir);
        	obj.direction = Math.atan2(obj.dy, obj.dx);
        } else {
        	rtsGame.pointToTarget(obj, target);
        }
    },    
    moveToPoint: function(obj, target) {
        var dir = rtsGame.pointTo(obj, target);
        var dist = rtsGame.distTo(obj, target);
        obj.dx += obj.moveTo.vel * Math.cos(dir);
        obj.dy += obj.moveTo.vel * Math.sin(dir);
        obj.direction = Math.atan2(obj.dy, obj.dx);
    },
    applyPhysics: function(obj) {
        obj.x += obj.dx;
        obj.y += obj.dy;
        obj.dx *= obj.drag;
        obj.dy *= obj.drag;
    },
    gameObject: function(type, x, y, team, dx, dy) {
        var obj = new gameObjectParams[type]();
        obj.type = type;
        obj.x = x;
        obj.y = y;
        obj.team = team;
        obj.dx = dx || 0;
        obj.dy = dy || 0;
        obj.direction = 0;
        obj.variableDraw = obj.variableDraw || {};
        obj.variableDraw.strokes = [];
        obj.hp = obj.maxHP;
        obj.energy = obj.maxEnergy;
        obj.drag = obj.drag || 0.95;
        obj.targeting = "nearest";
        obj.orders = [];
        return obj;
    },
    getPlayerFromTeam: function (players, team) {
        for (var i = 0; players.length > i; i++) {
            if (players[i].team == team) {
                return players[i];
            }
        }
    },
    createGameObject: function (room, type, x, y, team, dx, dy) {
        room.o.push(this.gameObject(type, x, y, team, dx, dy));
        room.o[room.o.length - 1].id = room.currentID;
        room.currentID++;
        if (type == "ControlTower") {
            var p = this.getPlayerFromTeam(room.serverPlayerData, team);
            room.o[room.o.length - 1].controlTowerID = p.controlTowerCount;
            p.controlTowerCount++;
        }
    },
    fireProj: function(projName, obj, target, velocity, room) {
        var all = room.o;
        var dir = rtsGame.pointTo(obj, target);
        
        //all.push(rtsGame.gameObject(projName, obj.x, obj.y, obj.team, Math.cos(dir) * velocity, Math.sin(dir) * velocity));
        this.createGameObject(room, projName, obj.x, obj.y, obj.team, Math.cos(dir) * velocity, Math.sin(dir) * velocity);
        all[all.length - 1].sender = obj;
        all[all.length - 1].intendedTarget = target;
    },
    simpleFireBehavior: function (obj, target, room) {
    	obj.simpleFireBehavior.t++;
        if (obj.simpleFireBehavior.t >= obj.simpleFireBehavior.timer && obj.energy >= obj.simpleFireBehavior.energy && rtsGame.distTo(obj, target) < obj.simpleFireBehavior.range) {
        	obj.simpleFireBehavior.t = 0;
            rtsGame.fireProj(obj.simpleFireBehavior.projName, obj, target, obj.simpleFireBehavior.velocity, room);
            obj.energy -= obj.simpleFireBehavior.energy;
        }
    },
    collide: function (obj, all, callback) {
    	for (var i = 0; all.length > i; i++) {
        	if (all[i].collide) {
            	var e = all[i].collide;
                var dist = rtsGame.distTo(obj, all[i]);
                if (obj.collide.rad + e.rad > dist) {
                	callback(obj, all[i], dist);
                }
            }
        }
    },
    projCollide: function (obj, all) {
        rtsGame.collide(obj, all, function (obj, target, dist) {			
            if (rtsGame.isEnemy(obj, target)) {
                obj.dead = true;
                target.hp -= obj.hp;
                obj.hp = 0;
                target.energy -= obj.energy;
                obj.energy = 0;
            }
        });
    },
    projCollideFriendly: function (obj, all) {
        rtsGame.collide(obj, all, function (obj, target, dist) {			
            if (rtsGame.isAlly(obj, target) && target == obj.intendedTarget) {
                obj.dead = true;
                target.hp -= obj.hp;
                obj.hp = 0;
                target.energy -= obj.energy;
                obj.energy = 0;
            }
        });
    },
    isEnemy: function (obj, target) {
    	return (obj.team != target.team) && !target.nonCombatTarget;
    },
    isAlly: function (obj, target) {
    	return (obj.team == target.team) && !target.nonCombatTarget;
    },
    nearestEnemy: function (obj, all) {
    	return rtsGame.nearest(obj, all, e => { return rtsGame.isEnemy(obj, e) });
    },
    strongestEnemy: function (obj, all) {
        return all.reduce((acc, current) => { return (rtsGame.isEnemy(obj, current) ? ((acc.hp > current.hp) ? acc : current) : acc) }, rtsGame.nearestEnemy(obj, all));
    },
    weakestEnemy: function (obj, all) {
        return all.reduce((acc, current) => { return (rtsGame.isEnemy(obj, current) ? ((acc.hp < current.hp) ? acc : current) : acc) }, rtsGame.nearestEnemy(obj, all));
    },
    nearestAlly: function (obj, all, range) {
    	return rtsGame.nearest(obj, all, e => { return rtsGame.isAlly(obj, e) && rtsGame.distTo(obj, e) < range });
    },
    strongestAlly: function (obj, all) {
        return all.reduce((acc, current) => { return (rtsGame.isAlly(obj, current) ? ((acc.hp > current.hp) ? acc : current) : acc) }, rtsGame.nearestAlly(obj, all));
    },
    weakestAlly: function (obj, all) {
        return all.reduce((acc, current) => { return (rtsGame.isAlly(obj, current) ? ((acc.hp < current.hp) ? acc : current) : acc) }, rtsGame.nearestAlly(obj, all));
    },
    weakestEnergy: function (obj, all, range) {
        return all.reduce((acc, current) => { return ((rtsGame.isAlly(obj, current) && rtsGame.distTo(obj, current) < range && current !== obj && current.energy != current.maxEnergy) ? ((acc.energy < current.energy) ? acc : current) : acc) }, rtsGame.nearestAlly(obj, all));
    },
    inRange: function (obj, target, range) {
        return rtsGame.distTo(obj, target) < range;
    },
    max: function (obj, all, property, condition) {
        return all.reduce((acc, current) => { return (condition(obj, current) ? ((acc[property] > current[property]) ? acc : current) : acc) }, { property: -Infinity, didThisReturnNothing: true });
    },
    min: function (obj, all, property, condition) {
        return all.reduce((acc, current) => { return (condition(obj, current) ? ((acc[property] < current[property]) ? acc : current) : acc) }, { property: Infinity, didThisReturnNothing: true });
    },
    chainedCondition: function (obj, target) {
        var cond = true;
        for (var i = 2; arguments.length > i; i++) {
            cond = cond && rtsGame.conditionals[arguments[i]](obj, target);
        }
        return cond;
    },
    conditionals: {
        isEnemy: function (obj, target) {
            return (obj.team != target.team) && !target.nonCombatTarget && obj !== target;
        },
        isAlly: function (obj, target) {
            return (obj.team == target.team) && !target.nonCombatTarget && obj !== target;
        },
        combatTarget: function (obj, target) {
            return !target.nonCombatTarget;
        },
        needsEnergy: function (obj, target) {
            return target.maxEnergy - 30 > target.energy;
        }
    },
    handleTargeting: function (obj, all) {
    	var funcs = {
			nearest: rtsGame.nearestEnemy,
            strongest: rtsGame.strongestEnemy,
            weakest: rtsGame.weakestEnemy
        }
        return funcs[obj.targeting](obj, all);
    },
    useEnergy: function (obj) {
    	obj.energy -= obj.useEnergy.passive;
        if (obj.energy < 0) {
        	obj.energy = 0;
        }
        if (obj.energy > obj.maxEnergy) {
        	obj.energy = obj.maxEnergy;
        }
    },
    collideSpaceship: function (obj, all) {
        rtsGame.collide(obj, all, function (obj, target, dist) {
            if (!target.nonCombatTarget) {
                var dir = rtsGame.pointTo(obj, target);
                
                obj.dx -= 0.8 * Math.cos(dir);
                obj.dy -= 0.8 * Math.sin(dir);
                target.dx += 0.8 * Math.cos(dir);
                target.dy += 0.8 * Math.sin(dir);
            }
        });
    },
    inRect: function (obj, x, y, w, h) {
        if (w < 0) {
            x += w;
            w *= -1
        }
        if (h < 0) {
            y += h;
            h *= -1
        }
        return obj.x > x && obj.x < x + w && obj.y > y && obj.y < y + h;
    },
    regPolygon: function (size, sides, xOffset, yOffset, angleOffset) {
        var poly = [];
        for (var i = 0; sides > i; i++) {
            var dir = i / sides * TAU + angleOffset;
            poly.push({
                x: Math.cos(dir) * size + xOffset,
                y: Math.sin(dir) * size + yOffset
            });
        }
        return poly;
    },
    orderCondition: function (obj, moveFunc) {
        if (obj.orders.length > 0) {
            var e = obj.orders[0];
            if (e.type == "move") {
                this.moveToPoint(obj, e);
                obj.variableDraw.strokes.push({
                    color: "overlay",
                    type: "path",
                    pts: [
                        {
                            x: obj.x,
                            y: obj.y,
                        }, 
                        {
                            x: e.x,
                            y: e.y
                        }
                    ]
                });
                if (this.dist(obj.x, obj.y, e.x, e.y) < obj.collide.rad * 8) {
                    obj.orders.splice(0, 1);
                }
            } else if (e.type == "stop") {
                obj.variableDraw.strokes.push({
                    color: "overlay",
                    type: "path",
                    empty: true,
                    pts: this.regPolygon(obj.collide.rad * 3.5, 8, obj.x, obj.y, TAU / 16)
                });
                if (obj.orders.length > 1) {
                    obj.orders.splice(0, 1);
                }
            }
        } else {
            moveFunc();
        }
    },
    clearVariableDraw: function (obj) {
        for (var i = 0; obj.variableDraw.strokes.length > i; i++) {
            var e = obj.variableDraw.strokes[i];
            if (e.source != "custom") {
                obj.variableDraw.strokes.splice(i, 1);
            }
        }
    },
    clientSafePropList: ["targeting"]
}