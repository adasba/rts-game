//canvas declarations
var c = document.getElementById("canvas");
var canvasContext = c.getContext("2d");



function PlayerClient(team, uuid) {
    this.team = team;
    this.uuid = uuid;
    this.selected = [];
    this.orders = [];
    this.rectSelect = function (all, x, y, w, h, add) {
        var selection = all.filter(e => {  return e.team == this.team && rtsGame.inRect(e, x, y, w, h) && !this.nonCombatTarget });
        if (add) {
            this.selected = this.selected.concat(selection);
        } else {
            this.selected = selection;
        }
    }
    this.nearestSelect = function (all, x, y, add) {
        var selection = rtsGame.nearest({ x: x, y: y }, all, e => { return e.team == this.team && !this.nonCombatTarget });
        if (rtsGameClient.distTo(selection, { x: x, y: y }) < selection.collide.rad * 4 / scale.factor) {
            if (add) {
                this.selected.push(selection);
            } else {
                this.selected = [selection];
            }
            return true;
        }
        return false;
    }
    this.displaySelection = function(ctx) {
        ctx.setLineDash([5, 5]);
        for (var i = 0; this.selected.length > i; i++) {
            var e = this.selected[i];
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.collide.rad * 2.5, 0, TAU);
            ctx.stroke();
        }
        if (this.selectParams.displayMouseDown) {
            ctx.strokeRect(this.selectParams.x, this.selectParams.y, this.selectParams.w, this.selectParams.h);
        }
    }
    this.selectParams = {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        mouseDown: false,
        displayMouseDown: false
    };
    this.handleOrders = function (all, m, k) {
        if (k.kd[" "]) {
            this.moveOrder(m.tx, m.ty);
        }
        if (k.kd["x"]) {
            this.stopOrder();
        }
    }
    this.mouseSelect = function (all, m, k) {
        if (m.m[0]) {
            if (!this.selectParams.mouseDown) {
                this.selectParams.mouseDown = true;
                this.selectParams.x = m.tx;
                this.selectParams.y = m.ty;
            } else {
                this.selectParams.w = m.tx - this.selectParams.x;
                this.selectParams.h = m.ty - this.selectParams.y;
                this.selectParams.displayMouseDown = true;
            }
        } else {
            if (this.selectParams.mouseDown) {
                this.selectParams.displayMouseDown = false;
                this.selectParams.mouseDown = false;
                console.log(this.selectParams);
                if (Math.abs(this.selectParams.w) > 10 && Math.abs(this.selectParams.h) > 10) {
                    this.rectSelect(all, this.selectParams.x, this.selectParams.y, this.selectParams.w, this.selectParams.h, k.k.Shift);
                } else {
                    var didSelect = this.nearestSelect(all, this.selectParams.x, this.selectParams.y, k.k.Shift);
                    if (!didSelect && !k.k.Shift) {
                        this.selected = [];
                    }
                }
            }
        }
        this.initSelectGUI(selectGUIs, document.getElementById("select-gui-container"));
        this.handleOrders(all, m, k);
    }
    this.initSelectGUI = function (guis, elem) {
        var categories = [];
        for (var i = 0; this.selected.length > i; i++) {
            var e = this.selected[i];
            if (categories.indexOf(e.category) == -1) {
                categories.push(e.category);
            }
        }
        elem.innerHTML = "";
        for (var i = 0; categories.length > i; i++) {
            elem.innerHTML += guis[categories[i]].html;
            guis[categories[i]].initFunc(this);
        }
    }
    this.moveOrder = function (x, y) {
        for (var i = 0; this.selected.length > i; i++) {
            var e = this.selected[i];
            this.orders.push({ id: e.id, x: x, y: y, type: "move" });
        }
    }
    this.stopOrder = function () {
        for (var i = 0; this.selected.length > i; i++) {
            var e = this.selected[i];
            this.orders.push({ id: e.id, type: "stop" });
        }
    }
    this.changeProperty = function (property, value, discrim) {
        for (var i = 0; this.selected.length > i; i++) {
            var e = this.selected[i];
            if (discrim(e)) {
                this.orders.push({ id: e.id, type: "changeProperty", prop: property, value: value });
            }
        }
    }
}

c.width = window.innerWidth;
c.height = window.innerHeight;

window.addEventListener("resize", function (e) {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
});

var mouse = {
    m: [false, false, false],
    md: [false, false, false],
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    tx: 0,
    ty: 0,
    w: 0
};

var pos = {
    x: 0,
    y: 0
};

var scale = {
    factor: 1,
    log: 0,
    d: 0
}

//mouse move listener
c.addEventListener("mousemove", function(e) {
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.tx = (mouse.x - window.innerWidth / 2) / scale.factor + window.innerWidth / 2 + pos.x;
    mouse.ty = (mouse.y - window.innerHeight / 2) / scale.factor + window.innerHeight / 2 + pos.y;
    if (mouse.m[2]) {
        pos.x += (mouse.px - mouse.x) / scale.factor;
        pos.y += (mouse.py - mouse.y) / scale.factor;
    }
}, false);

c.addEventListener("mousedown", function(e) {
    mouse.m[e.which - 1] = true;
    mouse.md[e.which - 1] = true;
}, false);
c.addEventListener("mouseup", function(e) {
    mouse.m[e.which - 1] = false;
    mouse.md[e.which - 1] = false;
}, false);
document.addEventListener("wheel", function (e) {
    mouse.w = e.deltaY / 100;
}, false);

var keys = {
    k: {},
    kd: {}
};

document.addEventListener("keydown", function (e) {
    keys.k[e.key] = true;
    keys.kd[e.key] = true;
});
document.addEventListener("keyup", function (e) {
    keys.k[e.key] = false;
    keys.kd[e.key] = false;
});

var allClientData = { objects: [] };