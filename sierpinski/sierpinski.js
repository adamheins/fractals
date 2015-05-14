var SIDE_LENGTH = 500;

// Depth to which the fractal recurses.
var MAX_DEPTH = 10;

/*
 * 2D point.
 *
 * @param x - The x coordinate of the point.
 * @param y - The y coordinate of the point.
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

/*
 * Calculates the midpoint between this point and another.
 *
 * @param other - The other point. The midpoint is calculated between the other
 *                point and this one.
 *
 * @returns A new point at the midpoint between this point and the other point.
 */
Point.prototype.midPoint = function(other) {
    var midX = (this.x + other.x) / 2;
    var midY = (this.y + other.y) / 2;
    return new Point(midX, midY);
}

/*
 * Color object that simply hold a red, green, and blue value.
 *
 * @param r - Red value from 0 - 255.
 * @param g - Green value from 0 - 255.
 * @param b - Blue value from 0 - 255.
 */
function Color(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
}

/*
 * Converts the color object to a string.
 *
 * @returns A string representing the color.
 */
Color.prototype.toString = function() {
    return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
}

/*
 *
 */
function SierpinskiTriangle(p1, p2, p3) {
    this.points = [p1, p2, p3];
}

SierpinskiTriangle.prototype.generate = function(ctx, color) {
    var midA = this.points[0].midPoint(this.points[1]);
    var midB = this.points[1].midPoint(this.points[2]);
    var midC = this.points[2].midPoint(this.points[0]);

    return [
        new SierpinskiTriangle(this.points[0], midA, midC),
        new SierpinskiTriangle(this.points[1], midA, midB),
        new SierpinskiTriangle(this.points[2], midB, midC)
    ];
}

SierpinskiTriangle.prototype.draw = function(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    ctx.lineTo(this.points[1].x, this.points[1].y);
    ctx.lineTo(this.points[2].x, this.points[2].y);
    ctx.fill();
}

function draw(triangles, ctx, color, depth) {
    triangles.forEach(function(triangle) {
        color.r = 255 - Math.floor(255 * depth / MAX_DEPTH);
        triangle.draw(ctx, color.toString());
    });
}

function more(triangles) {
    var newTriangles = [];
    triangles.forEach(function(triangle) {
        newTriangles = newTriangles.concat(triangle.generate(ctx, color));
    });
    return newTriangles;
}

var canvas = document.getElementById('sierpinskiTriangle');
var ctx = canvas.getContext('2d');

var color = new Color(255, 0, 0);
var depth = MAX_DEPTH;

var h = 0.866 * SIDE_LENGTH;

canvas.width = SIDE_LENGTH;
canvas.height = h;

var a = new Point(0, h);
var b = new Point(canvas.width, h);
var c = new Point(canvas.width / 2, 0);

var triangles = [new SierpinskiTriangle(a, b, c)];
draw(triangles, ctx, color, depth);

canvas.addEventListener('click', function() {
    if (depth > 0) {
        triangles = more(triangles);
        draw(triangles, ctx, color, depth);
        --depth;
    }
});
