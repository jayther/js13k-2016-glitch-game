var raf = require('./raf'),
    rng = require('./rng'),
    Vec2 = require('./math/vec2'),
    AABB = require('./math/aabb'),
    CursorMgr = require('./input/cursormgr'),
    DisplayButton = require('./display/displaybutton'),
    DisplayItemContainer = require('./display/displaycontainer'),
    DisplayCircle = require('./display/displaycircle'),
    DisplayRect = require('./display/displayrect'),
    DisplayText = require('./display/displaytext'),
    Maze = require('./game/maze');

var canvas = document.querySelector('#game');
var ctx = canvas.getContext('2d');
ctx.font = '30px Arial';

var rand = rng();

var player = null;
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

var currentStage = null;

var canvasAABB = new AABB({
  x: canvas.width / 2,
  y: canvas.height / 2,
  hw: canvas.width / 2,
  hh: canvas.height / 2
});

var innerRoomAABB = new AABB({
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

var cursorMgr = new CursorMgr({
  areaTarget: canvas
});

cursorMgr.on('cursordown', function (e) {
  currentStage.triggerMouseDown(e);
});
cursorMgr.on('cursorup', function (e) {
  currentStage.triggerMouseUp(e);
});

cursorMgr.on('cursordown', function (e) {
  triggerGun = true;
});

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

var debugStage = new DisplayItemContainer({
  isStage: true,
  ctx: ctx
});
currentStage = debugStage;

var scrollLayer = new DisplayItemContainer();
debugStage.addChild(scrollLayer);

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
scrollLayer.addChild(player);

var triggerShapes = false;
var triggerGun = false;

var testButton = new DisplayButton({
  x: 50,
  y: 50,
  width: 100,
  height: 50,
  click: function (e) {
    triggerShapes = true;
    console.log('test button clicked');
  }
});
debugStage.addChild(testButton);

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

function createWalls(roomAABB, innerAABB, doorWidth) {
  var topWallMidpoint = (roomAABB.getTop() + innerAABB.getTop()) / 2,
      bottomWallMidpoint = (roomAABB.getBottom() + innerAABB.getBottom()) / 2,
      leftWallMidpoint = (roomAABB.getLeft() + innerAABB.getLeft()) / 2,
      rightWallMidpoint = (roomAABB.getRight() + innerAABB.getRight()) / 2,
      leftThickness = Math.abs(roomAABB.getLeft() - innerAABB.getLeft()),
      topThickness = Math.abs(roomAABB.getTop() - innerAABB.getTop()),
      rightThickness = Math.abs(roomAABB.getRight() - innerAABB.getRight()),
      bottomThickness = Math.abs(roomAABB.getBottom() - innerAABB.getBottom()),
      topBottomWallLength = (roomAABB.getWidth() - doorWidth) / 2,
      leftRightWallLength = (roomAABB.getHeight() - doorWidth) / 2,
      walls = [];
  
  var topLeftWall = new DisplayRect({
    aabb: {
      x: roomAABB.getLeft() + topBottomWallLength / 2,
      y: topWallMidpoint,
      hw: topBottomWallLength / 2,
      hh: topThickness / 2
    },
    color: rand.pick(colors)
  });
  walls.push(topLeftWall);
  var topRightWall = new DisplayRect({
    aabb: {
      x: roomAABB.getRight() - topBottomWallLength / 2,
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
      y: roomAABB.getTop() + leftRightWallLength / 2,
      hw: rightThickness / 2,
      hh: leftRightWallLength / 2
    },
    color: rand.pick(colors)
  });
  walls.push(rightTopWall);
  var rightBottomWall = new DisplayRect({
    aabb: {
      x: rightWallMidpoint,
      y: roomAABB.getBottom() - leftRightWallLength / 2,
      hw: rightThickness / 2,
      hh: leftRightWallLength / 2
    },
    color: rand.pick(colors)
  });
  walls.push(rightBottomWall);
  var bottomLeftWall = new DisplayRect({
    aabb: {
      x: roomAABB.getLeft() + topBottomWallLength / 2,
      y: bottomWallMidpoint,
      hw: topBottomWallLength / 2,
      hh: bottomThickness / 2
    },
    color: rand.pick(colors)
  });
  walls.push(bottomLeftWall);
  var bottomRightWall = new DisplayRect({
    aabb: {
      x: roomAABB.getRight() - topBottomWallLength / 2,
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
      y: roomAABB.getTop() + leftRightWallLength / 2,
      hw: leftThickness / 2,
      hh: leftRightWallLength / 2
    },
    color: rand.pick(colors)
  });
  walls.push(leftTopWall);
  var leftBottomWall = new DisplayRect({
    aabb: {
      x: leftWallMidpoint,
      y: roomAABB.getBottom() - leftRightWallLength / 2,
      hw: leftThickness / 2,
      hh: leftRightWallLength / 2
    },
    color: rand.pick(colors)
  });
  walls.push(leftBottomWall);
  return walls;
}

var maze = Maze.generate(Date.now());
var startVec = new Vec2(0, 0);
var roomAABBs = [];
maze.mazeArray.forEach(function (rows, row) {
  rows.forEach(function (room, col) {
    if (room) {
      var x = col * canvas.width,
          y = row * canvas.height,
          roomAABB = new AABB({
            x: x,
            y: y,
            hw: canvas.width / 2,
            hh: canvas.height / 2
          }),
          innerRoomAABB = new AABB({
            x: x,
            y: y,
            hw: canvas.width / 2 - 20,
            hh: canvas.height / 2 - 20
          });
      if (room === 1) {
        startVec.x = x;
        startVec.y = y;
      }
      walls = walls.concat(createWalls(roomAABB, innerRoomAABB, doorWidth));
      roomAABBs.push(roomAABB);
    }
  });
});

walls.forEach(function (wall) {
  scrollLayer.addChild(wall);
});

player.x = startVec.x;
player.y = startVec.y;

scrollLayer.x = canvas.width / 2 - startVec.x;
scrollLayer.y = canvas.height / 2 - startVec.y;

var debugMouseDisplay = new DisplayText({
  text: 'rawrawr',
  textAlign: 'left',
  textBaseline: 'top',
  x: 5,
  y: 5,
  color: '#ffffff'
});
debugStage.addChild(debugMouseDisplay);

function render(elapsed) {
  // Clear the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  debugStage.preRender(elapsed);
  debugStage.render(elapsed);
  debugStage.postRender(elapsed);
}
function logicUpdate(elapsed) {
  var i;
  
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
    debugStage.removeChild(b);
  }
  
  if (kbKeys[Keys.LEFT]) {
    scrollLayer.dx = playerSpeed;
  } else if (kbKeys[Keys.RIGHT]) {
    scrollLayer.dx = -playerSpeed;
  } else {
    scrollLayer.dx = 0;
  }
  if (kbKeys[Keys.UP]) {
    scrollLayer.dy = playerSpeed;
  } else if (kbKeys[Keys.DOWN]) {
    scrollLayer.dy = -playerSpeed;
  } else {
    scrollLayer.dy = 0;
  }
  
  if (kbKeys[Keys.A]) {
    player.dx = -playerSpeed;
  } else if (kbKeys[Keys.D]) {
    player.dx = playerSpeed;
  } else {
    player.dx = 0;
  }
  if (kbKeys[Keys.W]) {
    player.dy = -playerSpeed;
  } else if (kbKeys[Keys.S]) {
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
  
  roomAABBs.forEach(function (roomAABB) {
    if (roomAABB.contains(player.x, player.y)) {
      scrollLayer.x = canvas.width / 2 - roomAABB.x;
      scrollLayer.y = canvas.height / 2 - roomAABB.y;
    }
  });
  
  if (triggerGun) {
    var bulletVelocity = cursorMgr.vec.copy();
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
    debugStage.addChild(bullet);
  }
  
  scrollLayer.update(elapsed);
  currentStage.update(elapsed);
  
  triggerShapes = false;
  triggerGun = false;
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
