var raf = require('./raf'),
    rng = require('./rng'),
    Vec2 = require('./math/vec2'),
    DisplayItemContainer = require('./display/displaycontainer'),
    DisplayCircle = require('./display/displaycircle'),
    DisplayRect = require('./display/displayrect'),
    DisplayText = require('./display/displaytext');

var canvas = document.querySelector('#game');
var ctx = canvas.getContext('2d');

var rand = rng();

var balls = [];
var boxes = [];
var colors = [
  '#7FDBFF', '#0074D9', '#01FF70', '#001F3F', '#39CCCC',
  '#3D9970', '#2ECC40', '#FF4136', '#85144B', '#FF851B',
  '#B10DC9', '#FFDC00', '#F012BE',
];

var logicAccumulator = 0;
var logicFrameRate = 1 / 30;
var logicMaxSteps = 5;

var mouseDown = false;
var mouseVec = new Vec2(0, 0);
var mouseDownChanged = false;

canvas.addEventListener('mousedown', function (e) {
  mouseDown = true;
  mouseDownChanged = true;
}, false);

canvas.addEventListener('mousemove', function (e) {
  var rect = canvas.getBoundingClientRect();
  mouseVec.x = Math.floor(e.pageX - rect.left);
  mouseVec.y = Math.floor(e.pageY - rect.top);
}, false);

canvas.addEventListener('mouseup', function (e) {
  mouseDown = false;
  mouseDownChanged = true;
}, false);

var stage = new DisplayItemContainer({
  isStage: true,
  ctx: ctx
});

ctx.font = '30px Arial';

for (var i = 0; i < 25; i++) {
  balls.push(new DisplayCircle({
    x: rand.int(canvas.width),
    y: rand.int(canvas.height / 2),
    radius: rand.range(15, 35),
    dx: rand.range(-100, 100),
    dy: 0,
    color: rand.pick(colors)
  }));
  stage.addChild(balls[i]);
}

for (var i = 0; i < 25; i++) {
  boxes.push(new DisplayRect({
    x: rand.int(canvas.width),
    y: rand.int(canvas.height / 2),
    aabb: {
      hw: rand.range(15, 35),
      hh: rand.range(15, 35),
    },
    dx: rand.range(-100, 100),
    dy: 0,
    color: rand.pick(colors)
  }));
  stage.addChild(boxes[i]);
}

var debugMouseDisplay = new DisplayText({
  text: 'rawrawr',
  textAlign: 'left',
  textBaseline: 'top',
  x: 5,
  y: 5,
  color: '#ffffff'
});
stage.addChild(debugMouseDisplay);

function render(elapsed) {
  // Clear the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  stage.preRender(elapsed);
  stage.render(elapsed);
  stage.postRender(elapsed);
}
function logicUpdate(elapsed) {
  // Update each balls
  balls.forEach(function(ball) {
    if (mouseDownChanged && mouseDown) {
      ball.dx += rand.range(-1000, 1000);
      ball.dy += rand.range(-1000, 1000);
    }
    // Gravity
    ball.dy += elapsed * 500;

    // Handle collision against the canvas's edges
    if (ball.x - ball.radius < 0 && ball.dx < 0 || ball.x + ball.radius > canvas.width && ball.dx > 0) ball.dx = -ball.dx * 0.7;
    if (ball.y - ball.radius < 0 && ball.dy < 0 || ball.y + ball.radius > canvas.height && ball.dy > 0) ball.dy = -ball.dy * 0.7;
    
    ball.update(elapsed);
  });
  
  // Update each box
  boxes.forEach(function (box) {
    if (mouseDownChanged && mouseDown) {
      box.dx += rand.range(-1000, 1000);
      box.dy += rand.range(-1000, 1000);
      debugMouseDisplay.text = 'triggered at ' + mouseVec.x + ', ' + mouseVec.y;
    }
    box.dy += elapsed * 500;
    
    if (box.x - box.aabb.hw < 0 && box.dx < 0 || box.x + box.aabb.hw > canvas.width && box.dx > 0) box.dx = -box.dx * 0.7;
    if (box.y - box.aabb.hh < 0 && box.dy < 0 || box.y + box.aabb.hh > canvas.height && box.dy > 0) box.dy = -box.dy * 0.7;
    
    box.update(elapsed);
  });
  
  mouseDownChanged = false;
}

raf.start(function(elapsed) {
  logicAccumulator += elapsed;
  for (i = 0; i < logicMaxSteps && logicAccumulator >= logicFrameRate; i += 1) {
    logicUpdate(logicFrameRate);
    logicAccumulator -= logicFrameRate;
  }
  render(elapsed);
});
