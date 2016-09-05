var DisplayContainer = require('../display/displaycontainer'),
    DisplayRect = require('../display/displayrect'),
    DisplayText = require('../display/displaytext'),
    DisplayCircle = require('../display/displaycircle'),
    inherit = require('../util/inherit'),
    extend = require('../util/extend'),
    Maze = require('./maze'),
    AABB = require('../math/aabb'),
    Vec2 = require('../math/vec2'),
    kbMgr = require('../input/kbmgr'),
    raf = require('../raf'),
    rng = require('../rng'),
    cursorMgr = require('../input/cursormgr');

var Keys = {
  UP: 38,
  LEFT: 37,
  DOWN: 40,
  RIGHT: 39,
  A: 65,
  S: 83,
  D: 68,
  W: 87,
  Q: 81,
  R: 82
};

var colors = [
  '#7FDBFF', '#0074D9', '#01FF70', '#001F3F', '#39CCCC',
  '#3D9970', '#2ECC40', '#FF4136', '#85144B', '#FF851B',
  '#B10DC9', '#FFDC00', '#F012BE',
];

var playerSpeed = 200;
var bulletSpeed = 1000;

var rand = rng(Date.now());

function assignWalls(maze) {
  var doorWidth = maze.doorWidth,
      visualWalls = [],
      rand = rng(maze.seed);
  maze.traverseRooms(function (room) {
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
  
  return visualWalls;
}

function assignEnemies(maze) {
  var enemies = [];
  maze.traverseRooms(function (room, col, row) {
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
  return enemies;
}

function createRoomLabels(maze) {
  var labels = [];
  maze.traverseRooms(function (room) {
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
  return labels;
}

function assignEndHatch(maze, endSizeAABB) {
  var endHatch = null;
  maze.traverseRooms(function (room) {
    if (room.type === 2) {
      var endAABB = endSizeAABB.copy();
      endAABB.x = room.innerAABB.x;
      endAABB.y = room.innerAABB.y;
      room.endAABB = endAABB;
      endHatch = new DisplayRect({
        aabb: endAABB,
        color: '#000000'
      });
    }
  });
  return endHatch;
}

function PlayStage(options) {
  DisplayContainer.call(this, extend({
    isStage: true,
    viewSizeAABB: null,
    roomSizeAABB: null,
    innerRoomSizeAABB: null,
    doorWidth: 0,
    mazeSeed: Date.now(),
    player: null,
    level: 0
  }, options || {}));
  
  this.maze = null;
  this.currentRoom = null;
  this.bullets = [];
  
  this.scrollLayer = new DisplayContainer();
  this.addChild(this.scrollLayer);
  this.initMaze();
  this.scrollLayer.addChild(this.player);
  
  this.debugDisplay = new DisplayText({
    text: 'rawrawr ' + this.level,
    font: '30px Arial',
    textAlign: 'left',
    textBaseline: 'top',
    x: 10,
    y: 10,
    color: '#ffffff'
  });
  this.addChild(this.debugDisplay);
  
  this.on('cursordown', this.triggerGun.bind(this));
  this.on('keydown', function (e) {
    if (e.data.keyCode === Keys.R) {
      this.dispatch('restart', {
        level: this.level + 1
      });
    }
  }.bind(this));
}

PlayStage.prototype = inherit(DisplayContainer, {
  initMaze: function () {
    var scrollLayer = this.scrollLayer;
    var maze = Maze.generate(
      this.mazeSeed,
      this.roomSizeAABB,
      this.innerRoomSizeAABB,
      this.doorWidth
    );
    var walls = assignWalls(maze);

    walls.forEach(function (wall) {
      scrollLayer.addChild(wall);
    });
    
    var startVec = new Vec2(), currentRoom;
    maze.rooms.forEach(function (rows, row) {
      rows.forEach(function (room, col) {
        if (room.type === 1) {
          startVec.x = room.outerAABB.x;
          startVec.y = room.outerAABB.y;
          currentRoom = room;
        }
      });
    });
    
    this.maze = maze;
    this.currentRoom = currentRoom;

    var enemies = assignEnemies(maze);
    enemies.forEach(function (enemy) {
      scrollLayer.addChild(enemy);
    });

    var roomLabels = createRoomLabels(maze);
    roomLabels.forEach(function (label) {
      scrollLayer.addChild(label);
    });
    
    var endHatch = assignEndHatch(maze, AABB.createRect({ width: 60, height: 60 }));
    scrollLayer.addChild(endHatch);
    
    this.player.x = startVec.x;
    this.player.y = startVec.y;

    scrollLayer.x = this.viewSizeAABB.hw - startVec.x;
    scrollLayer.y = this.viewSizeAABB.hh - startVec.y;
  },
  update: function (elapsed) {
    var i,
        scrollLayer = this.scrollLayer,
        currentRoom = this.currentRoom,
        player = this.player,
        bullets = this.bullets;

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

    if (kbMgr.keys[Keys.LEFT]) {
      scrollLayer.vel.x = playerSpeed * 3;
    } else if (kbMgr.keys[Keys.RIGHT]) {
      scrollLayer.vel.x = -playerSpeed * 3;
    } else {
      scrollLayer.vel.x = 0;
    }
    if (kbMgr.keys[Keys.UP]) {
      scrollLayer.vel.y = playerSpeed * 3;
    } else if (kbMgr.keys[Keys.DOWN]) {
      scrollLayer.vel.y = -playerSpeed * 3;
    } else {
      scrollLayer.vel.y = 0;
    }

    if (kbMgr.keys[Keys.A]) {
      player.vel.x = -playerSpeed;
    } else if (kbMgr.keys[Keys.D]) {
      player.vel.x = playerSpeed;
    } else {
      player.vel.x = 0;
    }
    if (kbMgr.keys[Keys.W]) {
      player.vel.y = -playerSpeed;
    } else if (kbMgr.keys[Keys.S]) {
      player.vel.y = playerSpeed;
    } else {
      player.vel.y = 0;
    }
    if (kbMgr.keys[Keys.Q]) {
      raf.stop();
      this.debugDisplay.text = 'game stopped';
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
      scrollLayer.x = this.viewSizeAABB.hw - refocusToRoom.outerAABB.x;
      scrollLayer.y = this.viewSizeAABB.hh - refocusToRoom.outerAABB.y;
      currentRoom = refocusToRoom;
      this.currentRoom = currentRoom;
    } else if (currentRoom.endAABB && currentRoom.endAABB.containsAABB(player.collisionAABB)) {
      this.dispatch('restart', {
        level: this.level + 1
      });
    }

    scrollLayer.update(elapsed);
  },
  triggerGun: function (e) {
    var player = this.player,
        scrollLayer = this.scrollLayer,
        bullets = this.bullets;
    var bulletVelocity = e.data.copy();
    bulletVelocity.x -= scrollLayer.x;
    bulletVelocity.y -= scrollLayer.y;
    bulletVelocity.x -= player.x;
    bulletVelocity.y -= player.y;
    bulletVelocity.normalize();
    bulletVelocity.multiply(bulletSpeed);
    var bullet = new DisplayCircle({
      x: player.x,
      y: player.y,
      life: 2,
      radius: 5,
      color: rand.pick(colors)
    });
    bullet.vel.x = bulletVelocity.x;
    bullet.vel.y = bulletVelocity.y;
    bullets.push(bullet);
    scrollLayer.addChild(bullet);
  }
});

module.exports = PlayStage;