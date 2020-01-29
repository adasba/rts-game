
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
    }],
    EnergySpaceship: [
        {
            type: "rect",
            x: 12,
            y: 6,
            w: 5,
            h: 0
        },
        {
            type: "rect",
            x: 12,
            y: -6,
            w: 5,
            h: 0
        },
        {
            type: "path",
            pts: [
                {
                    x: -12,
                    y: -12
                },
                {
                    x: -12,
                    y: 12
                },
                {
                    x: 12,
                    y: 8
                },
                {
                    x: 12,
                    y: -8
                }
            ]
        }
    ],
    SimpleProjectile: [
        {
            type: "circle",
            x: 0,
            y: 0,
            r: 3
        }
    ],
    EnergyProjectile: [
        {
            type: "rect",
            x: -4,
            y: -4,
            w: 8,
            h: 8
        }
    ],
    SimpleTower: [
    	{
        	type: "rect",
            x: 0,
            y: -5,
            w: 20,
            h: 10
        },
        {
        	type: "circle",
            x: 0,
            y: 0,
            r: 13
        }
    ],
    // Asteroid: [
    // 	{
    //     	type: "drawFunc",
    //         f: function (ctx) {
    //         	ctx.beginPath();
    //             for (var i = 0; 12 > i; i++) {
    //             	ctx.lineTo(Math.cos(TAU / 12 * i) * 28 + rands[i] * 16 - 5, Math.sin(TAU / 12 * i) * 28 + rands[i + 12] * 16 - 5);
    //             }
    //             ctx.closePath();
    //             ctx.fill();
    //             ctx.stroke();
    //         }
    //     }
    // ]
};