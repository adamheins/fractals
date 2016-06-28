'use strict';

let DELTA_ITERATIONS = 500;
let BAILOUT_RADIUS = 1 << 16;
let MAGNIFICATION_STEP = 1.5;

function Mandelbrot(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.maxIterations = DELTA_ITERATIONS;

    this.offsetX = -2.5;
    this.offsetY = -1.0;

    this.magnification = 1;
}

// Call function f on each point in the set.
Mandelbrot.prototype.eachPoint = function(f) {
    for (let i = this.x; i < this.w + this.x; ++i) {
        for (let j = this.y; j < this.h + this.y; ++j) {
            f(i, j);
        }
    }
}

// Calculate the color for the given iteration values.
Mandelbrot.prototype.getColorAt = function(iter, minIter, maxIter) {
    let norm = iter - minIter;
    let range = maxIter - minIter;
    let hue = Math.floor(Math.sqrt(norm / range) * 255);
    return 'rgb(' + hue + ',' + hue + ',' + hue + ')';
}

// Calculate the number of iterations a given point passes.
Mandelbrot.prototype.getIterationsAt = function(xP, yP) {
    // Scale coordinates to lie within the Mandelbrot scale.
    let x0 = xP * 3.5 / this.magnification / this.w + this.offsetX;
    let y0 = yP * 2.0 / this.magnification / this.h + this.offsetY;

    let x = 0;
    let y = 0;

    // The number of iterations we reach determines the color of the pixel.
    let iter = 0;
    while (x * x + y * y < BAILOUT_RADIUS && iter < this.maxIterations) {
        let xTemp = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = xTemp;
        ++iter;
    }

    // Normalize the iterations to provide smoother coloring.
    if (iter < this.maxIterations) {
        let logZn = Math.log(x * x + y * y) / 2;
        let nu = Math.log(logZn / Math.log(2)) / Math.log(2);
        iter = iter + 1 - nu;
    }

    return iter;
}

// Draw a point in the set.
Mandelbrot.prototype.plot = function(ctx, xP, yP, color) {
    ctx.fillStyle = color;
    ctx.fillRect(xP, yP, 1, 1);
}

// Render the entire fractal.
Mandelbrot.prototype.draw = function(ctx) {
    let minIter = this.maxIterations;
    let maxIter = 0;

    // Find the minimum and maximum iterations required across all points in
    // the set.
    this.eachPoint((x, y) => {
        let iter = this.getIterationsAt(x, y);
        if (iter < minIter) {
            minIter = iter;
        } else if (iter > maxIter) {
            maxIter = iter;
        }
    });

    // Update the max iterations used so that we always maintain a constant
    // delta between min and max iterations.
    this.maxIterations = DELTA_ITERATIONS + minIter;

    // Draw each point in the set.
    this.eachPoint((x, y) => {
        let iter = this.getIterationsAt(x, y);
        let color = this.getColorAt(iter, minIter, maxIter);
        this.plot(ctx, x, y, color);
    });
}

// Change the magnification of the fractal.
Mandelbrot.prototype.magnify = function(multiplier) {
  this.magnification *= multiplier;
}

// Offset the image so that the center of image changes.
Mandelbrot.prototype.offset = function(xOffsetCenter, yOffsetCenter) {
    // Scale offsets to mandelbrot scale and current magnification.
    let xOffsetScaled = xOffsetCenter * 3.5 / this.magnification / this.w;
    let yOffsetScaled = yOffsetCenter * 2.0 / this.magnification / this.h;

    // Apply to existing offsets.
    this.offsetX += xOffsetScaled;
    this.offsetY += yOffsetScaled;
}

// Magnify a specific point on the fractal. This is a more general case of the
// magnify method, which magnifies at the center of the fractal.
Mandelbrot.prototype.magnifyAt = function(multiplier, x, y) {
    // First, we adjust the offset so the desired point of magnification is at
    // the center of the image. Next, the image is magnified. Finally, we
    // reverse the offset performed at first to return the point of interest to
    // its original location, automatically taking the new magnification into
    // account.
    this.offset(x, y);
    this.magnify(multiplier);
    this.offset(-x, -y);
}

let canvas = document.getElementById('mandelbrot');
let ctx = canvas.getContext('2d');
let launchButton = document.getElementById('launch');

let mandelbrot = new Mandelbrot(0, 0, canvas.width, canvas.height);

launchButton.addEventListener('click', () => {
    launchButton.style.display = 'none';

    canvas.addEventListener('click', (e) => {
        mandelbrot.magnifyAt(MAGNIFICATION_STEP, e.offsetX, e.offsetY);
        mandelbrot.draw(ctx);
    });

    mandelbrot.draw(ctx);
});

