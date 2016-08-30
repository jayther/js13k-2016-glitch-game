var raf = require('./raf'),
    rng = require('./rng'),
    Vec2 = require('./math/vec2'),
    AABB = require('./math/aabb'),
    DisplayButton = require('./display/displaybutton'),
    DisplayItemContainer = require('./display/displaycontainer'),
    DisplayCircle = require('./display/displaycircle'),
    DisplayRect = require('./display/displayrect'),
    DisplayText = require('./display/displaytext');

var canvas = document.querySelector('#game');
var ctx = canvas.getContext('2d');

var rand = rng();

var player = null;
var balls = [];
var boxes = [];
var bullets = [];
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

var buttonDowned = null;

var kbKeys = {};
var kbChanged = false;

var playerSpeed = 200;
var bulletSpeed = 1000;

var walls = [];

var canvasAABB = new AABB({
  x: canvas.width / 2,
  y: canvas.height / 2,
  hw: canvas.width / 2,
  hh: canvas.height / 2
});

var roomAABB = new AABB({
  x: canvas.width / 2,
  y: canvas.height / 2,
  hw: canvas.width / 2 - 40,
  hh: canvas.height / 2 - 40
});
var doorWidth = 50;

var Keys = {
  UP: 38,
  LEFT: 37,
  DOWN: 40,
  RIGHT: 39,
  A: 65,
  S: 83,
  D: 68,
  W: 87
};

canvas.addEventListener('mousedown', function (e) {
  mouseDown = true;
  mouseDownChanged = true;
  e.preventDefault();
}, false);

canvas.addEventListener('mousemove', function (e) {
  var rect = canvas.getBoundingClientRect();
  mouseVec.x = Math.floor(e.pageX - rect.left);
  mouseVec.y = Math.floor(e.pageY - rect.top);
  e.preventDefault();
}, false);

canvas.addEventListener('mouseup', function (e) {
  mouseDown = false;
  mouseDownChanged = true;
  e.preventDefault();
}, false);

window.addEventListener('keydown', function (e) {
  //debugMouseDisplay.text = 'key downed: ' + e.keyCode;
  kbKeys[e.keyCode] = true;
  kbChanged = true;
  e.preventDefault();
}, false);

window.addEventListener('keyup', function (e) {
  kbKeys[e.keyCode] = false;
  kbChanged = true;
  e.preventDefault();
}, false);

var stage = new DisplayItemContainer({
  isStage: true,
  ctx: ctx
});

ctx.font = '30px Arial';

player = new DisplayRect({
  x: canvas.width / 2,
  y: canvas.height / 2,
  aabb: {
    hw: 20,
    hh: 20
  },
  color: rand.pick(colors)
});
player.collisionAABB = player.aabb.copy();
player.collisionAABB.x = player.x;
player.collisionAABB.y = player.y;
player.oldCollisionAABB = player.collisionAABB.copy();
stage.addChild(player);

var triggerShapes = false;
var triggerGun = false;

var testButton = new DisplayButton({
  x: 50,
  y: 50,
  width: 100,
  height: 50,
  click: function (e) {
    triggerShapes = true;
  }
});
stage.addChild(testButton);

var testButtonDisplayRect = new DisplayRect({
  width: testButton.width,
  height: testButton.height,
  color: '#aaaaff'
});
testButton.addChild(testButtonDisplayRect);

var testButtonText = new DisplayText({
  text: 'rawrawr',
  font: '20px Arial',
  textAlign: 'center',
  textBaseline: 'middle',
  x: testButton.aabb.x,
  y: testButton.aabb.y,
  color: '#000000'
});
testButton.addChild(testButtonText);

function createWalls(canvasAABB, aabb, doorWidth) {
  var topWallMidpoint = (canvasAABB.getTop() + aabb.getTop()) / 2,
      bottomWallMidpoint = (canvasAABB.getBottom() + aabb.getBottom()) / 2,
      leftWallMidpoint = (canvasAABB.getLeft() + aabb.getLeft()) / 2,
      rightWallMidpoint = (canvasAABB.getRight() + aabb.getRight()) / 2,
      leftThickness = Math.abs(canvasAABB.getLeft() - aabb.getLeft()),
      topThickness = Math.abs(canvasAABB.getTop() - aabb.getTop()),
      rightThickness = Math.abs(canvasAABB.getRight() - aabb.getRight()),
      bottomThickness = Math.abs(canvasAABB.getBottom() - aabb.getBottom()),
      topBottomWallLength = (canvasAABB.getWidth() - doorWidth) / 2,
      leftRightWallLength = (canvasAABB.getHeight() - doorWidth) / 2,
      walls = [];
  
  var topLeftWall = new DisplayRect({
    aabb: {
      x: canvasAABB.getLeft() + topBottomWallLength / 2,
      y: topWallMidpoint,
      hw: topBottomWallLength / 2,
      hh: topThickness / 2
    },
    color: rand.pick(colors)
  });
  walls.push(topLeftWall);
  var topRightWall = new DisplayRect({
    aabb: {
      x: canvasAABB.getRight() - topBottomWallLength / 2,
      y: topWallMidpoint,
      hw: topBottomWallLength / 2,
      hh: topThickness / 2
    },
    color: rand.pick(colors)
  });
  walls.push(topRightWall);
  var rightTopWall = new DisplayRect({
    aabb: {
      x: rightWallMidpoint,
      y: canvasAABB.getTop() + leftRightWallLength / 2,
      hw: rightThickness / 2,
      hh: leftRightWallLength / 2
    },
    color: rand.pick(colors)
  });
  walls.push(rightTopWall);
  var rightBottomWall = new DisplayRect({
    aabb: {
      x: rightWallMidpoint,
      y: canvasAABB.getBottom() - leftRightWallLength / 2,
      hw: rightThickness / 2,
      hh: leftRightWallLength / 2
    },
    color: rand.pick(colors)
  });
  walls.push(rightBottomWall);
  var bottomLeftWall = new DisplayRect({
    aabb: {
      x: canvasAABB.getLeft() + topBottomWallLength / 2,
      y: bottomWallMidpoint,
      hw: topBottomWallLength / 2,
      hh: bottomThickness / 2
    },
    color: rand.pick(colors)
  });
  walls.push(bottomLeftWall);
  var bottomRightWall = new DisplayRect({
    aabb: {
      x: canvasAABB.getRight() - topBottomWallLength / 2,
      y: bottomWallMidpoint,
      hw: topBottomWallLength / 2,
      hh: bottomThickness / 2
    },
    color: rand.pick(colors)
  });
  walls.push(bottomRightWall);
  var leftTopWall = new DisplayRect({
    aabb: {
      x: leftWallMidpoint,
      y: canvasAABB.getTop() + leftRightWallLength / 2,
      hw: leftThickness / 2,
      hh: leftRightWallLength / 2
    },
    color: rand.pick(colors)
  });
  walls.push(leftTopWall);
  var leftBottomWall = new DisplayRect({
    aabb: {
      x: leftWallMidpoint,
      y: canvasAABB.getBottom() - leftRightWallLength / 2,
      hw: leftThickness / 2,
      hh: leftRightWallLength / 2
    },
    color: rand.pick(colors)
  });
  walls.push(leftBottomWall);
  return walls;
}

walls = createWalls(canvasAABB, roomAABB, doorWidth);

walls.forEach(function (wall) {
  stage.addChild(wall);
});

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
  var i;
  if (mouseDownChanged) {
    if (mouseDown && !buttonDowned) {
      for (i = stage.buttons.length - 1; i >= 0 && !buttonDowned; i--) {
        var button = stage.buttons[i];
        if (button.isStageVisible()) {
          var stagePos = button.getStagePos();
          if (button.aabb.contains(mouseVec.x - stagePos.x, mouseVec.y - stagePos.y)) {
            buttonDowned = button;
          }
        }
      }
    } else if (!mouseDown && buttonDowned) {
      var stagePos = buttonDowned.getStagePos();
      if (buttonDowned.aabb.contains(mouseVec.x - stagePos.x, mouseVec.y - stagePos.y)) {
        buttonDowned.click(mouseVec);
      }
      buttonDowned = null;
    }
    if (mouseDown && !buttonDowned) {
      triggerGun = true;
    }
  }
  
  //indexes
  var bulletsToRemove = [];
  bullets.forEach(function (bullet) {
    bullet.life -= elapsed;
    bullet.update(elapsed);
    if (bullet.life <= 0) {
      bulletsToRemove.push(bullet);
    }
  });
  for (i = bulletsToRemove.length - 1; i >= 0; i--) {
    var b = bullets.splice(bulletsToRemove[i], 1)[0];
    stage.removeChild(b);
    console.log('removed');
  }
  
  if (kbKeys[Keys.LEFT] || kbKeys[Keys.A]) {
    player.dx = -playerSpeed;
  } else if (kbKeys[Keys.RIGHT] || kbKeys[Keys.D]) {
    player.dx = playerSpeed;
  } else {
    player.dx = 0;
  }
  if (kbKeys[Keys.UP] || kbKeys[Keys.W]) {
    player.dy = -playerSpeed;
  } else if (kbKeys[Keys.DOWN] || kbKeys[Keys.S]) {
    player.dy = playerSpeed;
  } else {
    player.dy = 0;
  }
  
  player.update(elapsed);
  player.oldCollisionAABB.x = player.collisionAABB.x;
  player.oldCollisionAABB.y = player.collisionAABB.y;
  player.collisionAABB.x = player.x;
  player.collisionAABB.y = player.y;
  
  var collision = false;
  walls.forEach(function (wall) {
    var clipped = false;
    if (wall.aabb.collidesAABB(player.collisionAABB)) {
      collision = true;
      if (player.collisionAABB.getRight() > wall.aabb.getLeft() &&
          player.oldCollisionAABB.getRight() <= wall.aabb.getLeft()) {
        clipped = true;
        player.x = wall.aabb.getLeft() - player.collisionAABB.hw;
      } else if (player.collisionAABB.getLeft() < wall.aabb.getRight() &&
                 player.oldCollisionAABB.getLeft() >= wall.aabb.getRight()) {
        clipped = true;
        player.x = wall.aabb.getRight() + player.collisionAABB.hw;
      }
      if (player.collisionAABB.getTop() < wall.aabb.getBottom() &&
          player.oldCollisionAABB.getTop() >= wall.aabb.getBottom()) {
        clipped = true;
        player.y = wall.aabb.getBottom() + player.collisionAABB.hh;
      } else if (player.collisionAABB.getBottom() > wall.aabb.getTop() &&
                 player.oldCollisionAABB.getBottom() <= wall.aabb.getTop()) {
        clipped = true;
        player.y = wall.aabb.getTop() - player.collisionAABB.hh;
      }
    }
    if (clipped) {
      player.collisionAABB.x = player.x;
      player.collisionAABB.y = player.y;
    }
  });
  debugMouseDisplay.text = 'collision: ' + collision;
  
  if (triggerGun) {
    var bulletVelocity = mouseVec.copy();
    bulletVelocity.x -= player.x;
    bulletVelocity.y -= player.y;
    bulletVelocity.normalize();
    bulletVelocity.multiply(bulletSpeed);
    var bullet = new DisplayCircle({
      x: player.x,
      y: player.y,
      dx: bulletVelocity.x,
      dy: bulletVelocity.y,
      life: 2,
      radius: 5,
      color: rand.pick(colors)
    });
    bullets.push(bullet);
    stage.addChild(bullet);
  }
  
  triggerShapes = false;
  triggerGun = false;
  mouseDownChanged = false;
  kbChanged = false;
}

raf.start(function(elapsed) {
  logicAccumulator += elapsed;
  for (i = 0; i < logicMaxSteps && logicAccumulator >= logicFrameRate; i += 1) {
    logicUpdate(logicFrameRate);
    logicAccumulator -= logicFrameRate;
  }
  render(elapsed);
});
