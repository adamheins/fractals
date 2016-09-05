'use strict';

let MAX_DEPTH = 5;

let INITIAL_LENGTH = 400;
let INITIAL_HEIGHT = Math.sqrt(3) / 2 * INITIAL_LENGTH;

let DEG30 = Math.PI / 6;
let DEG60 = Math.PI / 3;
let DEG150 = Math.PI * 5 / 6;
let DEG270 = Math.PI * 1.5;

function Point(x, y) {
    this.x = x;
    this.y = y;
}

// Render the fractal.
function render(ctx, points, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    points.forEach(point => {
        ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
}

// Create the new generation of points and angles between one pair of points.
function stepOne(pointA, pointB, angle) {
    let dx = pointB.x - pointA.x;
    let dy = pointB.y - pointA.y;
    let length = Math.sqrt(dx * dx + dy * dy);

    // Points various fractions of the way along the line between `pointA` and
    // `pointB`.
    let point13 = new Point(pointA.x + dx / 3,  pointA.y + dy / 3);
    let point12 = new Point(pointA.x + dx / 2, pointA.y + dy / 2);
    let point23 = new Point(pointA.x + dx * 2 / 3, pointA.y + dy * 2 / 3);

    // The point at the tip of the "spike".
    let pointSpike = new Point(point12.x + length * Math.cos(angle) / 3,
                               point12.y - length * Math.sin(angle) / 3);

    // We've chosen to include `pointA` in the returned array of new points,
    // rather than `pointB`. It must be one or the other, not both, to avoid
    // duplication of points.
    return {
        'points': [pointA, point13, pointSpike, point23],
        'angles': [angle, angle + DEG60, angle - DEG60, angle]
    };
}

// Create the new generation of points and angles.
function step(points, angles) {
    let childPoints = [];
    let childAngles = [];

    for (let i = 1; i < points.length; ++i) {
        let values = stepOne(points[i - 1], points[i], angles[i - 1]);
        childPoints = childPoints.concat(values['points']);
        childAngles = childAngles.concat(values['angles']);
    }
    let values = stepOne(points[points.length - 1], points[0],
                         angles[angles.length - 1]);
    childPoints = childPoints.concat(values['points']);
    childAngles = childAngles.concat(values['angles']);

    return {
        'points': childPoints,
        'angles': childAngles
    };
}

let canvas = document.getElementById('kochSnowflake');
let ctx = canvas.getContext('2d');

let cX = canvas.width / 2;
let cY = canvas.height / 2;

// The initial set of points defines a simple equilateral triangle.
let points = [new Point(cX, cY - INITIAL_HEIGHT * 2 / 3),
              new Point(cX + INITIAL_LENGTH / 2, cY + INITIAL_HEIGHT / 3),
              new Point(cX - INITIAL_LENGTH / 2, cY + INITIAL_HEIGHT / 3)];
let angles = [DEG30, DEG270, DEG150];
let depth = 0;

render(ctx, points, 'black');

canvas.addEventListener('click', () => {
    if (depth < MAX_DEPTH) {
        let values = step(points, angles);
        points = values['points'];
        angles = values['angles'];

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        render(ctx, points, 'black');

        ++depth;
    }
});
