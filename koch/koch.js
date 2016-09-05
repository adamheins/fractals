'use strict';

let MAX_DEPTH = 5;
let INITIAL_RADIUS = 200;

let DEG30 = Math.PI / 6;
let DEG60 = Math.PI / 3;
let DEG90 = Math.PI / 2;
let DEG120 = Math.PI * 2 / 3;
let DEG150 = Math.PI * 5 / 6;
let DEG270 = Math.PI * 1.5;

// Represents a triangle in the snowflake. The `orientation` parameter is the
// angle of any of the triangle's three points from center.
function Triangle(x, y, r, orientation, childOrientations) {
    this.x = x; // x-coordinate of center point.
    this.y = y; // y-coordinate of center point.
    this.r = r; // Radius (center point to tip).

    this.orientations = [orientation, orientation + DEG120,
                         orientation + 2 * DEG120];

    // `childOrientations` may be passed in, otherwise they will be calculated
    // here. This allows for the root triangle to be constructed with
    // manually-specified child orientations.
    if (childOrientations === undefined) {
        this.childOrientations = [orientation + DEG60, orientation - DEG60];
    } else {
        this.childOrientations = childOrientations;
    }
}

// Generate the triangle's child triangles.
Triangle.prototype.spawn = function() {
    let orientations = this.orientations.concat(this.childOrientations);

    let children = orientations.map(orientation => {
        let childX = this.x + this.r * 2 / 3 * Math.cos(orientation);
        let childY = this.y + this.r * 2 / 3 * Math.sin(orientation);
        let childR = this.r / 3;

        return new Triangle(childX, childY, childR, orientation);
    });

    return children;
}

// Draw the triangle.
Triangle.prototype.draw = function(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(this.x + this.r * Math.cos(this.orientations[0]),
               this.y + this.r * Math.sin(this.orientations[0]));
    ctx.lineTo(this.x + this.r * Math.cos(this.orientations[1]),
               this.y + this.r * Math.sin(this.orientations[1]));
    ctx.lineTo(this.x + this.r * Math.cos(this.orientations[2]),
               this.y + this.r * Math.sin(this.orientations[2]));
    ctx.fill();
}

// Render the triangles.
function render(triangles) {
    triangles.forEach(triangle => {
        triangle.draw(ctx, 'black');
    });
}

// Generate the new generation of triangles.
function more(triangles) {
    let children = [];
    triangles.forEach(triangle => {
        let spawn = triangle.spawn();
        children = children.concat(spawn);
    });
    return children;
}

let canvas = document.getElementById('kochSnowflake');
let ctx = canvas.getContext('2d');

// The starting triangle.
let root = new Triangle(canvas.width / 2, canvas.height / 2, INITIAL_RADIUS,
                        DEG90, [DEG30, DEG150, DEG270]);
let triangles = [root];
let depth = 0;

render(triangles);

canvas.addEventListener('click', () => {
    if (depth < MAX_DEPTH) {
        triangles = more(triangles);
        render(triangles);
        ++depth;
    }
});
