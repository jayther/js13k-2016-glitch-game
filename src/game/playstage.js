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
    sign = require('../util/sign'),
    cursorMgr = require('../input/cursormgr'),
    animMgr = require('../anim/mgr'),
    Anim = require('../anim/anim'),
    AnimGroup = require('../anim/group');

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

var states = {
  fadingIn: 'fadingin',
  play: 'play',
  fadingOut: 'fadingout'
};

var colors = [
  '#7FDBFF', '#0074D9', '#01FF70', '#001F3F', '#39CCCC',
  '#3D9970', '#2ECC40', '#FF4136', '#85144B', '#FF851B',
  '#B10DC9', '#FFDC00', '#F012BE',
];

var bulletSpeed = 1000;
var playerAccel = 2000;

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
      var rand = rng(room.type);
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
  
  this.state = null;
  
  this.scrollLayer = new DisplayContainer();
  this.addChild(this.scrollLayer);
  this.initMaze();
  this.scrollLayer.addChild(this.player);
  
  this.fadeOverlay = new DisplayRect({
    aabb: this.viewSizeAABB,
    color: '#000000',
    visible: false,
    opacity: 0
  });
  this.addChild(this.fadeOverlay);
  
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
  
  this.on('cursordown', function () {
    this.player.shooting = true;
  }.bind(this));
  this.on('cursorup', function () {
    this.player.shooting = false;
  }.bind(this));
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
    if (this.state === states.play) {
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
          for (var i = 0; i < currentRoom.enemies.length; i++) {
            var enemy = currentRoom.enemies[i];
            if (enemy.collideAABB.contains(bullet.x, bullet.y)) {
              bulletsToRemove.push(index);
              enemiesToRemove.push(i);
              break;
            }
          }
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
        scrollLayer.vel.x = player.maxSpeed * 3;
      } else if (kbMgr.keys[Keys.RIGHT]) {
        scrollLayer.vel.x = -player.maxSpeed * 3;
      } else {
        scrollLayer.vel.x = 0;
      }
      if (kbMgr.keys[Keys.UP]) {
        scrollLayer.vel.y = player.maxSpeed * 3;
      } else if (kbMgr.keys[Keys.DOWN]) {
        scrollLayer.vel.y = -player.maxSpeed * 3;
      } else {
        scrollLayer.vel.y = 0;
      }
      player.accel.x = 0;
      player.accel.y = 0;
      if (kbMgr.keys[Keys.A]) {
        player.accel.x -= playerAccel;
      }
      if (kbMgr.keys[Keys.D]) {
        player.accel.x += playerAccel;
      }
      if (kbMgr.keys[Keys.W]) {
        player.accel.y -= playerAccel;
      }
      if (kbMgr.keys[Keys.S]) {
        player.accel.y += playerAccel;
      }
      if (player.accel.x === 0 && player.vel.x !== 0) {
        player.accel.x = playerAccel * -sign(player.vel.x);
        if (Math.abs(player.vel.x + player.accel.x * elapsed) < Math.abs(player.accel.x * elapsed)) {
          player.accel.x = 0;
          player.vel.x = 0;
        }
      }
      if (player.accel.y === 0 && player.vel.y !== 0) {
        player.accel.y = playerAccel * -sign(player.vel.y);
        if (Math.abs(player.vel.y + player.accel.y * elapsed) < Math.abs(player.accel.y * elapsed)) {
          player.accel.y = 0;
          player.vel.y = 0;
        }
      }
      if (kbMgr.keys[Keys.Q]) {
        raf.stop();
        this.debugDisplay.text = 'game stopped';
      }

      player.update(elapsed);
      
      if (player.shooting && player.shootTimeLeft <= 0) {
        this.triggerGun();
      }

      var collision = false;
      currentRoom.wallAABBs.forEach(function (wall) {
        var clipped = false;
        if (wall.collidesAABB(player.collisionAABB)) {
          collision = true;
          if (player.collisionAABB.getRight() > wall.getLeft() &&
              player.oldCollisionAABB.getRight() <= wall.getLeft()) {
            clipped = true;
            player.x = wall.getLeft() - player.collisionAABB.hw;
            player.vel.x = 0;
          } else if (player.collisionAABB.getLeft() < wall.getRight() &&
                     player.oldCollisionAABB.getLeft() >= wall.getRight()) {
            clipped = true;
            player.x = wall.getRight() + player.collisionAABB.hw;
            player.vel.x = 0;
          }
          if (player.collisionAABB.getTop() < wall.getBottom() &&
              player.oldCollisionAABB.getTop() >= wall.getBottom()) {
            clipped = true;
            player.y = wall.getBottom() + player.collisionAABB.hh;
            player.vel.y = 0;
          } else if (player.collisionAABB.getBottom() > wall.getTop() &&
                     player.oldCollisionAABB.getBottom() <= wall.getTop()) {
            clipped = true;
            player.y = wall.getTop() - player.collisionAABB.hh;
            player.vel.y = 0;
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
        this.fadeOut();
      }

      scrollLayer.update(elapsed);
    }
  },
  triggerGun: function () {
    var player = this.player,
        scrollLayer = this.scrollLayer,
        bullets = this.bullets;
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
      life: 2,
      radius: 5,
      color: rand.pick(colors)
    });
    bullet.vel.x = bulletVelocity.x;
    bullet.vel.y = bulletVelocity.y;
    bullets.push(bullet);
    scrollLayer.addChild(bullet);
    player.shootTimeLeft = player.shootDelay;
  },
  fadeIn: function () {
    this.fadeOverlay.visible = true;
    this.fadeOverlay.opacity = 1;
    this.state = states.fadingIn;
    animMgr.run(new Anim({
      target: this.fadeOverlay,
      prop: 'opacity',
      start: 1,
      end: 0,
      duration: 1,
      callback: function () {
        this.fadeOverlay.visible = false;
        this.state = states.play;
      }.bind(this)
    }));
  },
  fadeOut: function () {
    this.state = states.fadingOut;
    this.fadeOverlay.visible = true;
    this.fadeOverlay.opacity = 0;
    this.scrollLayer.anchorX = this.currentRoom.outerAABB.x;
    this.scrollLayer.anchorY = this.currentRoom.outerAABB.y;
    this.scrollLayer.x = this.viewSizeAABB.hw;
    this.scrollLayer.y = this.viewSizeAABB.hh;
    var group = new AnimGroup({
      anims: [
        new Anim({
          target: this.fadeOverlay,
          prop: 'opacity',
          start: 0,
          end: 1,
          duration: 1
        }),
        new Anim({
          target: this.scrollLayer,
          prop: 'scaleX',
          start: 1,
          end: 10,
          duration: 1
        }),
        new Anim({
          target: this.scrollLayer,
          prop: 'scaleY',
          start: 1,
          end: 10,
          duration: 1
        })
      ],
      callback: function () {
        this.dispatch('restart', {
          level: this.level + 1
        });
      }.bind(this)
    });
    animMgr.run(group);
  }
});

module.exports = PlayStage;
