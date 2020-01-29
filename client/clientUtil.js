
var rtsGameClient = {
    dist: function(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    },
    distTo: function(obj, target) {
        return rtsGame.dist(obj.x, obj.y, target.x, target.y);
    },
    isEnemy: function (obj, target) {
    	return (obj.team != target.team) && !target.nonCombatTarget;
    },
    isAlly: function (obj, target) {
    	return (obj.team == target.team) && !target.nonCombatTarget;
    },
    nearestEnemy: function (obj, all) {
    	return rtsGameClient.nearest(obj, all, e => { return rtsGameClient.isEnemy(obj, e) });
    },
    strongestEnemy: function (obj, all) {
        return all.reduce((acc, current) => { return (rtsGameClient.isEnemy(obj, current) ? ((acc.hp > current.hp) ? acc : current) : acc) }, rtsGameClient.nearestEnemy(obj, all));
    },
    weakestEnemy: function (obj, all) {
        return all.reduce((acc, current) => { return (rtsGameClient.isEnemy(obj, current) ? ((acc.hp < current.hp) ? acc : current) : acc) }, rtsGameClient.nearestEnemy(obj, all));
    },
    nearestAlly: function (obj, all, range) {
    	return rtsGameClient.nearest(obj, all, e => { return rtsGameClient.isAlly(obj, e) && rtsGameClient.distTo(obj, e) < range });
    },
    strongestAlly: function (obj, all) {
        return all.reduce((acc, current) => { return (rtsGameClient.isAlly(obj, current) ? ((acc.hp > current.hp) ? acc : current) : acc) }, rtsGameClient.nearestAlly(obj, all));
    },
    weakestAlly: function (obj, all) {
        return all.reduce((acc, current) => { return (rtsGameClient.isAlly(obj, current) ? ((acc.hp < current.hp) ? acc : current) : acc) }, rtsGameClient.nearestAlly(obj, all));
    },
    weakestEnergy: function (obj, all, range) {
        return all.reduce((acc, current) => { return ((rtsGameClient.isAlly(obj, current) && rtsGameClient.distTo(obj, current) < range && current !== obj && current.energy != current.maxEnergy) ? ((acc.energy < current.energy) ? acc : current) : acc) }, rtsGameClient.nearestAlly(obj, all));
    },
    inRange: function (obj, target, range) {
        return rtsGameClient.distTo(obj, target) < range;
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
            cond = cond && rtsGameClient.conditionals[arguments[i]](obj, target);
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
    inRect: function (obj, x, y, w, h) {
        return obj.x > x && obj.x < x + w && obj.y > y && obj.y < y + h;
    }
}