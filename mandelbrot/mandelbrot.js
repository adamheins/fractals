var MAX_ITERATIONS = 500;

function makePalette() {
    var palette = [];
    for(var i = 0; i < MAX_ITERATIONS; ++i) {
        var value = Math.floor(Math.sqrt(i) * 255 / Math.sqrt(MAX_ITERATIONS));
        palette.push('rgb(' + value + ',' + value + ',' + value + ')');
    }
    console.log(palette);
    return palette;
}

function Mandelbrot(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.palette = makePalette();
}

function interpolate(a, b, fraction) {
    return a + (b - a) * fraction;
}

Mandelbrot.prototype.plot = function(xP, yP, ctx) {
    // Scale coordinates to lie within the Mandelbrot scale.
    var x0 = xP * 3.5 / this.w - 2.5;
    var y0 = yP * 2.0 / this.h - 1.0;

    var x = 0;
    var y = 0;

    // The number of iterations we reach determines the color of the pixel.
    // Higher iterations generally have more intense colors.
    var iter = 0;
    while (x * x + y * y < 4 && iter < MAX_ITERATIONS) {
        var xTemp = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = xTemp;
        ++iter;
    }

    // Draw the pixel.
    ctx.fillStyle = this.palette[iter - 1];
    ctx.fillRect(xP, yP, 1, 1);
}

Mandelbrot.prototype.draw = function(ctx) {
    for (var i = this.x; i < this.w + this.x; ++i) {
        for (var j = this.y; j < this.h + this.y; ++j) {
            this.plot(i, j, ctx);
        }
    }
}

function init() {
    var canvas = document.getElementById('mandelbrot');
    var ctx = canvas.getContext('2d');

    var mandelbrot = new Mandelbrot(0, 0, canvas.width, canvas.height);
    mandelbrot.draw(ctx);
}

var launchButton = document.getElementById('launch');
launchButton.addEventListener('click', function() {
    launchButton.style.display = 'none';
    init();
});

