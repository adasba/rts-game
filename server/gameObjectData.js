var gameObjectParams = {
    SimpleSpaceship: function () {
        this.category = "Combat";
        this.maxEnergy = 600;
        this.maxHP = 100;
        this.updateFunction = function(room) {
        	rtsGame.useEnergy(this);
            var nearestEnemy = rtsGame.handleTargeting(this, room.o);//rtsGame.nearestEnemy(this, room.o);
            if (this.energy != 0) {
                rtsGame.orderCondition(this, () => {
                    rtsGame.moveTo(this, nearestEnemy);
                });
            }
            rtsGame.simpleFireBehavior(this, nearestEnemy, room);

            rtsGame.collideSpaceship(this, room.o);
			rtsGame.applyPhysics(this);
        }
        this.moveTo = {
            range: 120,
			vel: 0.08
        }
        this.simpleFireBehavior = {
        	projName: "SimpleProjectile",
        	timer: 150,
            velocity: 5,
            t: 0,
            energy: 8,
            range: 160
        }
        this.collide = {
        	rad: 10
        }
        this.draw = {
        	layer: 1
        }
        this.useEnergy = {
        	passive: 0.4
        }
    },
    EnergySpaceship: function () {
        this.category = "Charge";
    	this.maxEnergy = 8000;
        this.maxHP = 150;
        this.localTime = 0;
        this.updateFunction = function (room) {
            this.variableDraw.strokes = [];
            this.localTime++;
            var nearestAlly = rtsGame.nearestAlly(this, room.o.filter(e => { return e.category != "Charge"; }), Infinity);
            rtsGame.useEnergy(this);
            if (this.energy == 0) {
                this.moveTo.vel = 0.04;
            } else {
                this.moveTo.vel = 0.1;
            }
            rtsGame.moveTo(this, nearestAlly);

            rtsGame.collideSpaceship(this, room.o);

            var alliesToPower = room.o.filter(e => { return rtsGame.chainedCondition(this, e, "isAlly", "needsEnergy", "combatTarget") && rtsGame.inRange(this, e, 360) && e.category != "Charge" });
            for (var i = 0; alliesToPower.length > i; i++) {
                if (this.energy > 1) {
                    alliesToPower[i].energy += 1;
                    this.energy -= 1;
                    this.variableDraw.strokes.push({
                        type: "path",
                        color: "energy",
                        pts: [
                            this,
                            alliesToPower[i]
                        ]
                    });
                }
            }
            rtsGame.applyPhysics(this);
        }
        this.moveTo = {
            range: 120,
			vel: 0.1
        }
        this.simpleFireBehavior = {
        	projName: "EnergyProjectile",
        	timer: 4,
            velocity: 3,
            t: 0,
            energy: 15,
            range: 360
        }
        this.collide = {
        	rad: 12
        }
        this.draw = {
        	layer: 1
        }
        this.useEnergy = {
        	passive: 0.2
        }
        this.variableDraw = {
            strokes: []
        };
    },
    SimpleProjectile: function () {
    	this.nonCombatTarget = true;
    	this.maxEnergy = 0;
        this.maxHP = 25;
        this.updateFunction = function(room) {
        	rtsGame.applyPhysics(this);
            this.lifetime--;
            if (this.lifetime == 0) {
            	this.dead = true;
            }
            rtsGame.projCollide(this, room.o);
        };
        this.drag = 1;
        this.lifetime = 100;
        this.collide = {
        	rad: 3
        }
        this.draw = {
        	layer: 0
        }
    },
    EnergyProjectile: function () {
    	this.nonCombatTarget = true;
        this.maxEnergy = -15;
        this.maxHP = 0.00001;
        this.updateFunction = function(room) {
        
            //canvasContext.strokeText("im here", 40, 40);
            rtsGame.applyPhysics(this);
            //rtsGame.moveTo(this, this.intendedTarget);
                //this.intendedTarget = rtsGame.nearest(this, room.o, e => { return rtsGame.isAlly(this, e) && e.maxEnergy - e.energy > 50 && e.category == "Combat" });
            this.intendedTarget = rtsGame.min(this, room.o, "energy", (obj, current) => { return rtsGame.chainedCondition(obj, current, "isAlly", "needsEnergy", "combatTarget") && rtsGame.inRange(this, current, 300) });
            if (this.intendedTarget.didThisReturnNothing) {
                this.intendedTarget = this.sender;
            }
            rtsGame.moveTo(this, this.intendedTarget);
            this.lifetime--;
            if (this.lifetime == 0) {
                this.dead = true;
                this.sender.energy += 15;
            }
            rtsGame.projCollideFriendly(this, room.o);
        };
        this.drag = 0.9;
        this.lifetime = 50;
        this.collide = {
        	rad: 3
        }
        this.draw = {
        	layer: 0
        },
        this.moveTo = {
            vel: 1.5,
            range: 0
        }
    },
    SimpleTower: function() {
        this.category = "Combat";
    	this.maxEnergy = 800;
        this.maxHP = 300;
        this.updateFunction = function (room) {
        	rtsGame.useEnergy(this);
        	var nearestEnemy = rtsGame.nearestEnemy(this, room.o);
        	rtsGame.simpleFireBehavior(this, nearestEnemy, room);
            rtsGame.pointToTarget(this, nearestEnemy);
        }
        this.collide = {
        	rad: 12
        };
        this.simpleFireBehavior = {
        	projName: "SimpleProjectile",
        	timer: 50,
            velocity: 5,
            t: 0,
 			energy: 10,
            range: 320
        };
        this.draw = {
        	layer: 2
        }
        this.useEnergy = {
        	passive: 0.2
        }
    },
    Asteroid: function () {
        this.nonCombatTarget = true;
    	this.maxEnergy = 0;
        this.maxHP = 2000;
        this.updateFunction = function (room) {}
        this.collide = {
        	rad: 30
        }

        this.rands = [];
        for (var i = 0; 24 > i; i++) {
            this.rands.push(Math.random());
        }

        this.draw = {
            layer: 2,
            strokes: [{
                type: "drawFunc",
                f: function (ctx) {
                    ctx.beginPath();
                    for (var i = 0; 12 > i; i++) {
                        ctx.lineTo(Math.cos(TAU / 12 * i) * 28 + this.rands[i] * 16 - 5, Math.sin(TAU / 12 * i) * 28 + this.rands[i + 12] * 16 - 5);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }.bind(this)
            }]
        }
    }
}