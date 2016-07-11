'use strict';

let DELTA_ITERATIONS = 500;
let BAILOUT_RADIUS = 1 << 16;
let MAGNIFICATION_STEP = 1.5;
let REVERSE_MAGNIFICATION_STEP = 1 / MAGNIFICATION_STEP;

let SCALE_FACTOR_X = 3.5;
let SCALE_FACTOR_Y = 2.0;
let ASPECT_RATIO = SCALE_FACTOR_X / SCALE_FACTOR_Y;

let INITIAL_OFFSET_X = -2.5;
let INITIAL_OFFSET_Y = -1.0;

function Mandelbrot(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.maxIterations = DELTA_ITERATIONS;

    this.offsetX = INITIAL_OFFSET_X;
    this.offsetY = INITIAL_OFFSET_Y;

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
    let scale = Math.floor(Math.sqrt(norm / range) * 255 * 3);

    // Palette algorithm.
    if (scale < 255 * 2) {
        // Go from black to blue toward white
        let b = scale < 255 ? scale : 255;
        let rg = Math.floor(scale / 4);
        return 'rgb(' + rg + ',' + rg + ',' + b + ')';
    } else if (scale < 255 * 3 - 1) {
        // Transition back toward black.
        let rg = Math.floor(255 / 2 - (scale - 255 * 2) / 3);
        let b = rg * 2;
        return 'rgb(' + rg + ',' + rg + ',' + b + ')';
    } else {
        return 'rgb(0, 0, 0)';
    }
}

// Calculate the number of iterations a given point passes.
Mandelbrot.prototype.getIterationsAt = function(xP, yP) {
    // Scale coordinates to lie within the Mandelbrot scale.
    let x0 = xP * SCALE_FACTOR_X / this.magnification / this.w + this.offsetX;
    let y0 = yP * SCALE_FACTOR_Y / this.magnification / this.h + this.offsetY;

    let x = 0;
    let y = 0;

    // The number of iterations we reach determines the color of the pixel.
    let iter = 0;

    // First, we can check if the point lies within either of the two main
    // bulbs, indicating that it is in the set.
    let a = x0 - 0.25;
    let q = a * a + y0 * y0;
    if ((q * (q + a)) < 0.25 * y0 * y0) {
      iter = this.maxIterations;
    }

    // Escape time algorithm.
    while (x * x + y * y < BAILOUT_RADIUS && iter < this.maxIterations) {
        let xTemp = x * x - y * y + x0;
        let yTemp = 2 * x * y + y0;

        // Check if the previous iteration yields the same value as this one.
        // If so, we know this point is part of the set.
        if (x === xTemp && y === yTemp) {
          iter = this.maxIterations;
          break;
        }

        x = xTemp;
        y = yTemp;
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

    // Draw each point in the set.
    this.eachPoint((x, y) => {
        let iter = this.getIterationsAt(x, y);
        let color = this.getColorAt(iter, minIter, maxIter);
        this.plot(ctx, x, y, color);
    });

    // Update the max iterations used so that we always maintain a constant
    // delta between min and max iterations.
    this.maxIterations = DELTA_ITERATIONS + minIter;
}

// Change the magnification of the fractal.
Mandelbrot.prototype.magnify = function(multiplier) {
    this.magnification *= multiplier;
}

// Offset the image so that the center of image changes.
Mandelbrot.prototype.offset = function(xOffsetCenter, yOffsetCenter) {
    // Scale offsets to mandelbrot scale and current magnification.
    let xOffsetScaled = xOffsetCenter * SCALE_FACTOR_X / this.magnification / this.w;
    let yOffsetScaled = yOffsetCenter * SCALE_FACTOR_Y / this.magnification / this.h;

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

// Magnify the Mandelbrot fractal at the currently-displayed center.
Mandelbrot.prototype.magnifyCenter = function(multiplier) {
    let xC = mandelbrot.w / 2;
    let yC = mandelbrot.h / 2;
    mandelbrot.magnifyAt(MAGNIFICATION_STEP, xC, yC);
}

// Fit the Mandelbrot within a given width and height, maintaining a desired
// aspect ratio.
Mandelbrot.prototype.fit = function(width, height) {
    // Desired aspect ratio is SCALE_FACTOR_X by SCALE_FACTOR_Y.
    if (width < ASPECT_RATIO * height) {
        this.w = width;
        this.h = Math.floor(width / ASPECT_RATIO);
    } else {
        this.w = Math.floor(height * ASPECT_RATIO);
        this.h = height;
    }
}

let canvas = document.getElementById('mandelbrot');
let ctx = canvas.getContext('2d');

let mandelbrot = new Mandelbrot(0, 0, window.innerWidth, window.innerHeight);

// Update dimensions and draw the fractal.
function render() {
    mandelbrot.fit(window.innerWidth, window.innerHeight);
    canvas.width = mandelbrot.w;
    canvas.height = mandelbrot.h;

    mandelbrot.draw(ctx);
}

window.addEventListener('resize', render, false);

document.getElementById('launch').addEventListener('click', () => {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('demo').style.display = 'block';

    // Clicking the fractal causes that point to be moved to the center.
    canvas.addEventListener('click', (e) => {
        let offsetX = e.offsetX - mandelbrot.w / 2;
        let offsetY = e.offsetY - mandelbrot.h / 2;
        mandelbrot.offset(offsetX, offsetY);
        mandelbrot.draw(ctx);
    });

    // The mousewheel zooms in and out.
    canvas.addEventListener('wheel', (e) => {
        // We only care about scroll events in the vertical direction.
        if (e.deltaY === 0) {
            return;
        }

        if (e.deltaY < 0) {
            mandelbrot.magnifyAt(MAGNIFICATION_STEP, e.offsetX, e.offsetY);
            mandelbrot.draw(ctx);
        } else {
            mandelbrot.magnifyAt(REVERSE_MAGNIFICATION_STEP, e.offsetX,
                                 e.offsetY);
            mandelbrot.draw(ctx);
        }
    });

    document.getElementById('zoom-in').addEventListener('click', () => {
        mandelbrot.magnifyCenter(MAGNIFICATION_STEP);
        mandelbrot.draw(ctx);
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        mandelbrot.magnifyCenter(REVERSE_MAGNIFICATION_STEP);
        mandelbrot.draw(ctx);
    });

    document.getElementById('reset').addEventListener('click', () => {
        mandelbrot = new Mandelbrot(0, 0, window.innerWidth, window.innerHeight);
        render();
    });

    render();
});

