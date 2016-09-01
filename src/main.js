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
var currentRoom = null;
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
var wallCollideAABBs = [];

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
/*debugStage.scaleX = 0.5;
debugStage.scaleY = 0.5;
debugStage.x = canvas.width / 4;
debugStage.y = canvas.height / 4;*/
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

function assignWalls(maze) {
  var rooms = maze.rooms,
      doorWidth = maze.doorWidth,
      visualWalls = [],
      rand = rng(maze.seed);
  rooms.forEach(function (rows, row) {
    rows.forEach(function (room, col) {
      var color, aabb;
      if (room.type) {
        //left wall
        color = rand.pick(colors);
        if (room.left) {
          aabb = AABB.createRect({
            left: room.outerAABB.getLeft(),
            top: room.outerAABB.getTop(),
            right: room.innerAABB.getLeft(),
            bottom: room.outerAABB.y - doorWidth / 2
          });
          visualWalls.push(new DisplayRect({
            aabb: aabb,
            color: color
          }));
          room.wallAABBs.push(aabb);
          aabb = AABB.createRect({
            left: room.outerAABB.getLeft(),
            top: room.outerAABB.y + doorWidth / 2,
            right: room.innerAABB.getLeft(),
            bottom: room.outerAABB.getBottom()
          });
          room.wallAABBs.push(aabb);
          visualWalls.push(new DisplayRect({
            aabb: aabb,
            color: color
          }));
        } else {
          aabb = AABB.createRect({
            left: room.outerAABB.getLeft(),
            top: room.outerAABB.getTop(),
            right: room.innerAABB.getLeft(),
            bottom: room.outerAABB.getBottom()
          });
          room.wallAABBs.push(aabb);
          visualWalls.push(new DisplayRect({
            aabb: aabb,
            color: color
          }));
        }
        //top wall
        color = rand.pick(colors);
        if (room.top) {
          aabb = AABB.createRect({
            left: room.outerAABB.getLeft(),
            top: room.outerAABB.getTop(),
            right: room.outerAABB.x - doorWidth / 2,
            bottom: room.innerAABB.getTop()
          });
          room.wallAABBs.push(aabb);
          visualWalls.push(new DisplayRect({
            aabb: aabb,
            color: color
          }));
          aabb = AABB.createRect({
            left: room.outerAABB.x + doorWidth / 2,
            top: room.outerAABB.getTop(),
            right: room.outerAABB.getRight(),
            bottom: room.innerAABB.getTop()
          });
          room.wallAABBs.push(aabb);
          visualWalls.push(new DisplayRect({
            aabb: aabb,
            color: color
          }));
        } else {
          aabb = AABB.createRect({
            left: room.outerAABB.getLeft(),
            top: room.outerAABB.getTop(),
            right: room.outerAABB.getRight(),
            bottom: room.innerAABB.getTop()
          });
          room.wallAABBs.push(aabb);
          visualWalls.push(new DisplayRect({
            aabb: aabb,
            color: color
          }));
        }
        //right wall
        color = rand.pick(colors);
        if (room.right) {
          aabb = AABB.createRect({
            left: room.innerAABB.getRight(),
            top: room.outerAABB.getTop(),
            right: room.outerAABB.getRight(),
            bottom: room.outerAABB.y - doorWidth / 2
          });
          room.wallAABBs.push(aabb);
          visualWalls.push(new DisplayRect({
            aabb: aabb,
            color: color
          }));
          aabb = AABB.createRect({
            left: room.innerAABB.getRight(),
            top: room.outerAABB.y + doorWidth / 2,
            right: room.outerAABB.getRight(),
            bottom: room.outerAABB.getBottom()
          });
          room.wallAABBs.push(aabb);
          visualWalls.push(new DisplayRect({
            aabb: aabb,
            color: color
          }));
        } else {
          aabb = AABB.createRect({
            left: room.innerAABB.getRight(),
            top: room.outerAABB.getTop(),
            right: room.outerAABB.getRight(),
            bottom: room.outerAABB.getBottom()
          });
          room.wallAABBs.push(aabb);
          visualWalls.push(new DisplayRect({
            aabb: aabb,
            color: color
          }));
        }
        //bottom wall
        color = rand.pick(colors);
        if (room.bottom) {
          aabb = AABB.createRect({
            left: room.outerAABB.getLeft(),
            top: room.innerAABB.getBottom(),
            right: room.outerAABB.x - doorWidth / 2,
            bottom: room.outerAABB.getBottom()
          });
          room.wallAABBs.push(aabb);
          visualWalls.push(new DisplayRect({
            aabb: aabb,
            color: color
          }));
          aabb = AABB.createRect({
            left: room.outerAABB.x + doorWidth / 2,
            top: room.innerAABB.getBottom(),
            right: room.outerAABB.getRight(),
            bottom: room.outerAABB.getBottom()
          });
          room.wallAABBs.push(aabb);
          visualWalls.push(new DisplayRect({
            aabb: aabb,
            color: color
          }));
        } else {
          aabb = AABB.createRect({
            left: room.outerAABB.getLeft(),
            top: room.innerAABB.getBottom(),
            right: room.outerAABB.getRight(),
            bottom: room.outerAABB.getBottom()
          });
          room.wallAABBs.push(aabb);
          visualWalls.push(new DisplayRect({
            aabb: aabb,
            color: color
          }));
        }
      }
    });
  });
  
  return visualWalls;
}

function assignEnemies(maze) {
  var enemies = [];
  maze.rooms.forEach(function (rows, row) {
    rows.forEach(function (room, col) {
      if (room.type > 2) {
        var roomEnemies = [];
        var rand = rng(maze.seed + room.type * row + col);
        var spawnArea = room.innerAABB.copy();
        spawnArea.hw -= 40;
        spawnArea.hh -= 40;
        var numEnemies = rand.range(2, 10), i, enemy;
        for (i = 0; i < numEnemies; i++) {
          enemy = new DisplayRect({
            x: rand.range(spawnArea.getLeft(), spawnArea.getRight()),
            y: rand.range(spawnArea.getTop(), spawnArea.getBottom()),
            color: rand.pick(colors),
            aabb: {
              hw: 20,
              hh: 20
            }
          });
          enemy.collideAABB = enemy.aabb.copy();
          enemy.collideAABB.x = enemy.x;
          enemy.collideAABB.y = enemy.y;
          roomEnemies.push(enemy);
          enemies.push(enemy);
        }
        room.enemies = roomEnemies;
      }
    });
  });
  return enemies;
}

function createRoomLabels(maze) {
  var labels = [];
  maze.rooms.forEach(function (rows, row) {
    rows.forEach(function (room, col) {
      if (room.type) {
        var text;
        if (room.type === 1) {
          text = 'START';
        } else if (room.type === 2) {
          text = 'FINISH';
        } else {
          text = 'TYPE: ' + room.type;
        }
        labels.push(new DisplayText({
          text: text,
          textAlign: 'left',
          textBaseline: 'bottom',
          x: room.innerAABB.getLeft() + 10,
          y: room.innerAABB.getBottom() - 10,
          color: '#ffffff'
        }));
      }
    });
  });
  return labels;
}

var maze = Maze.generate(
  Date.now(),
  AABB.createRect({ width: canvas.width, height: canvas.height}),
  AABB.createRect({ width: canvas.width - 40, height: canvas.height - 40 }),
  doorWidth
);
var startVec = new Vec2(0, 0);
var roomAABBs = [];
walls = assignWalls(maze);

walls.forEach(function (wall) {
  scrollLayer.addChild(wall);
});

maze.rooms.forEach(function (rows, row) {
  rows.forEach(function (room, col) {
    if (room.type === 1) {
      startVec.x = room.outerAABB.x;
      startVec.y = room.outerAABB.y;
      currentRoom = room;
    }
  });
});
var enemies = assignEnemies(maze);
enemies.forEach(function (enemy) {
  scrollLayer.addChild(enemy);
});

var roomLabels = createRoomLabels(maze);
roomLabels.forEach(function (label) {
  scrollLayer.addChild(label);
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
  var enemiesToRemove = [];
  bullets.forEach(function (bullet, index) {
    bullet.life -= elapsed;
    bullet.update(elapsed);
    if (!currentRoom.innerAABB.contains(bullet.x, bullet.y)) {
      bulletsToRemove.push(index);
    } else if (bullet.life <= 0) {
      bulletsToRemove.push(index);
    } else {
      currentRoom.enemies.forEach(function (enemy, eIndex) {
        if (enemy.collideAABB.contains(bullet.x, bullet.y)) {
          bulletsToRemove.push(index);
          enemiesToRemove.push(eIndex);
        }
      });
    }
  });
  for (i = bulletsToRemove.length - 1; i >= 0; i--) {
    var b = bullets.splice(bulletsToRemove[i], 1)[0];
    scrollLayer.removeChild(b);
  }
  for (i = enemiesToRemove.length - 1; i >= 0; i--) {
    var e = currentRoom.enemies.splice(enemiesToRemove[i], 1)[0];
    scrollLayer.removeChild(e);
  }
  
  if (kbKeys[Keys.LEFT]) {
    scrollLayer.dx = playerSpeed * 3;
  } else if (kbKeys[Keys.RIGHT]) {
    scrollLayer.dx = -playerSpeed * 3;
  } else {
    scrollLayer.dx = 0;
  }
  if (kbKeys[Keys.UP]) {
    scrollLayer.dy = playerSpeed * 3;
  } else if (kbKeys[Keys.DOWN]) {
    scrollLayer.dy = -playerSpeed * 3;
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
  currentRoom.wallAABBs.forEach(function (wall) {
    var clipped = false;
    if (wall.collidesAABB(player.collisionAABB)) {
      collision = true;
      if (player.collisionAABB.getRight() > wall.getLeft() &&
          player.oldCollisionAABB.getRight() <= wall.getLeft()) {
        clipped = true;
        player.x = wall.getLeft() - player.collisionAABB.hw;
      } else if (player.collisionAABB.getLeft() < wall.getRight() &&
                 player.oldCollisionAABB.getLeft() >= wall.getRight()) {
        clipped = true;
        player.x = wall.getRight() + player.collisionAABB.hw;
      }
      if (player.collisionAABB.getTop() < wall.getBottom() &&
          player.oldCollisionAABB.getTop() >= wall.getBottom()) {
        clipped = true;
        player.y = wall.getBottom() + player.collisionAABB.hh;
      } else if (player.collisionAABB.getBottom() > wall.getTop() &&
                 player.oldCollisionAABB.getBottom() <= wall.getTop()) {
        clipped = true;
        player.y = wall.getTop() - player.collisionAABB.hh;
      }
    }
    if (clipped) {
      player.collisionAABB.x = player.x;
      player.collisionAABB.y = player.y;
    }
  });
  debugMouseDisplay.text = 'collision: ' + collision;
  
  var refocusToRoom = null;
  if (currentRoom.left && currentRoom.left.outerAABB.contains(player.x, player.y)) {
    refocusToRoom = currentRoom.left;
  } else if (currentRoom.top && currentRoom.top.outerAABB.contains(player.x, player.y)) {
    refocusToRoom = currentRoom.top;
  } else if (currentRoom.right && currentRoom.right.outerAABB.contains(player.x, player.y)) {
    refocusToRoom = currentRoom.right;
  } else if (currentRoom.bottom && currentRoom.bottom.outerAABB.contains(player.x, player.y)) {
    refocusToRoom = currentRoom.bottom;
  }
  if (refocusToRoom) {
    scrollLayer.x = canvas.width / 2 - refocusToRoom.outerAABB.x;
    scrollLayer.y = canvas.height / 2 - refocusToRoom.outerAABB.y;
    currentRoom = refocusToRoom;
  }
  
  if (triggerGun) {
    var bulletVelocity = cursorMgr.vec.copy();
    bulletVelocity.x -= scrollLayer.x;
    bulletVelocity.y -= scrollLayer.y;
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
    scrollLayer.addChild(bullet);
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
