'use strict';

var MAX_ITERATIONS = 500;
var BAILOUT_RADIUS = 1 << 16;

function makePalette() {
    var palette = [];
    for(var i = 0; i < MAX_ITERATIONS; ++i) {
        var value = Math.floor(Math.sqrt(i) * 255 / Math.sqrt(MAX_ITERATIONS));
        palette.push('rgb(' + value + ',' + value + ',' + value + ')');
    }
    return palette;
}

function interpolate(a, b, fraction) {
    return a + (b - a) * fraction;
}

function Mandelbrot(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.offsetX = 0;
    this.offsetY = 0;

    this.magnification = 1;
}

Mandelbrot.prototype.plot = function(xP, yP, ctx) {
    // Scale coordinates to lie within the Mandelbrot scale.
    var x0 = xP * 3.5 / this.magnification / this.w - 2.5 + this.offsetX;
    var y0 = yP * 2.0 / this.magnification / this.h - 1.0 + this.offsetY;

    var x = 0;
    var y = 0;

    // The number of iterations we reach determines the color of the pixel.
    var iter = 0;
    while (x * x + y * y < BAILOUT_RADIUS && iter < MAX_ITERATIONS) {
        var xTemp = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = xTemp;
        ++iter;
    }

    if (iter < MAX_ITERATIONS) {
      var log_zn = Math.log10(x * x + y * y) / 2;
      var nu = Math.log10(log_zn / Math.log10(2)) / Math.log10(2);
      iter = iter + 1 - nu;
    }

    var a = Math.floor(Math.sqrt(Math.floor(iter)) * 255 / Math.sqrt(MAX_ITERATIONS));
    var b = Math.floor(Math.sqrt(Math.floor(iter) + 1) * 255 / Math.sqrt(MAX_ITERATIONS));
    var c = Math.floor(interpolate(a, b, iter % 1));
    var color = 'rgb(' + c + ',' + c + ',' + c + ')';

    // Draw the pixel.
    ctx.fillStyle = color;
    ctx.fillRect(xP, yP, 1, 1);
}

Mandelbrot.prototype.draw = function(ctx) {
    for (var i = this.x; i < this.w + this.x; ++i) {
        for (var j = this.y; j < this.h + this.y; ++j) {
            this.plot(i, j, ctx);
        }
    }
}

Mandelbrot.prototype.zoom = function(magnification) {
  this.magnification = magnification;
}

var canvas = document.getElementById('mandelbrot');
var ctx = canvas.getContext('2d');
var launchButton = document.getElementById('launch');

var mandelbrot = new Mandelbrot(0, 0, canvas.width, canvas.height);

canvas.addEventListener('click', (e) => {
    mandelbrot.magnification += 1;

    var offsetX = e.offsetX - mandelbrot.w / 2;
    var offsetY = e.offsetY - mandelbrot.h / 2;

    mandelbrot.offsetX += offsetX * 3.5 / mandelbrot.magnification / mandelbrot.w;
    mandelbrot.offsetY += offsetY * 2.0 / mandelbrot.magnification / mandelbrot.h;
    mandelbrot.draw(ctx);
});

launchButton.addEventListener('click', () => {
    launchButton.style.display = 'none';
    mandelbrot.draw(ctx);
});

