var MAX_ITER = 16;

/* Simple 2D point class. */
var Point = function(x, y) {
  this.x = x;
  this.y = y;
}

/* Creates a new point between two existing points in the given direction. */
function bend (p1, p2, direction) {
  var xLength = p2.x - p1.x;
  var yLength = p2.y - p1.y;

  var angle = direction * Math.PI / 4;

  var newX = (xLength * Math.cos(angle) - yLength * Math.sin(angle))
             * 0.707106781 + p1.x;
  var newY = (xLength * Math.sin(angle) + yLength * Math.cos(angle))
             * 0.707106781 + p1.y;

  return new Point(newX, newY);
}

/* Progresses the fractal, increasing the detail. */
function step (points) {
  for (var i = 1; i < points.length; i+=2) {
    var newPoint = bend(points[i - 1], points[i],
                   parseInt(i / 2) % 2 === 0 ? 1 : -1);
    points.splice(i, 0, newPoint);
  }
  ++iter;
}

/* Regresses the fractal, decreasing the detail. */
function stepBack (points) {
  if (points.length <= 2)
    return;
  // Remove every second point from the list.
  for (var i = 1; i < points.length; i++) {
    points.splice(i, 1);
  }
  --iter;
}

/* Draws a segment of the fractal in the given color. */
function drawSegment (p1, p2, context, color) {
  context.strokeStyle = color || 'rgb(255, 0, 0)';
  context.beginPath();
  context.moveTo(p1.x, p1.y);
  context.lineTo(p2.x, p2.y);
  context.stroke();
}

/* Draws the fractal curve. */
function drawCurve(points, context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 1; i < points.length; i++) {
    drawSegment(points[i - 1], points[i], context);
  }
}

/* Draws the fractal curve with fancier coloring. */
function drawCurveWithColor(points, context, canvas) {
  var colorStep = 255 / points.length;

  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 1; i < points.length; i++) {
    drawSegment(points[i - 1], points[i], context, '#'
        + Math.min(Math.floor((i - 1) * colorStep + 50), 255).toString(16)
        + '0000');
  }
}

// Canvas.
var c = document.getElementById('dragon');
var ctx = c.getContext('2d');

c.width = c.offsetWidth;
c.height = c.offsetHeight;

// Initial set up.
var points = [new Point(c.width * 2 / 7, c.height * 2 / 5),
              new Point(c.width * 6 / 7, c.height * 2 / 5)];
drawCurveWithColor(points, ctx, c);

var iter = 0;

// Key listener.
document.addEventListener('keydown', function(event) {
  if (event.keyCode === 39 && iter < MAX_ITER) {
    step(points);
    drawCurveWithColor(points, ctx, c);
  } else if (event.keyCode === 37 && iter > 0) {
    stepBack(points);
    drawCurveWithColor(points, ctx, c);
  }
});

// Mouse listener.
c.addEventListener('click', function() {
  if (iter < MAX_ITER) {
    step(points);
    drawCurveWithColor(points, ctx, c);
  }
});
