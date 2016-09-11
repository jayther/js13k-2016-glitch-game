var inherit = require('../util/inherit'),
    extend = require('../util/extend'),
    Vec2 = require('../math/vec2'),
    Appliable = require('../util/appliable'),
    AABB = require('../math/aabb'),
    rng = require('../rng');

var startType = 1;
var endType = 2;
var minRandType = 3;

function Maze(options) {
  this.applyOptions({
    seed: 0,
    mazeArray: [],
    roomSizeAABB: new AABB(),
    innerRoomSizeAABB: new AABB(),
    doorWidth: 0
  }, options);
  this.rooms = null;
  this.numRooms = 0;
  this.requiredFoods = 0;
  this.totalFoods = 0;
  this.init();
}
Maze.startType = startType;
Maze.endType = endType;
Maze.minRandType = minRandType;
Maze.prototype = inherit(Appliable, {
  init: function () {
    var mazeRand = rng(this.seed);
    var rooms = [];
    var roomSizeAABB = this.roomSizeAABB,
        innerRoomSizeAABB = this.innerRoomSizeAABB;
    
    //count rooms
    var numRooms = 0;
    this.mazeArray.forEach(function (rows, row) {
      rows.forEach(function (protoRoom, col) {
        if (protoRoom > 0) {
          numRooms++;
        }
      });
    });
    this.numRooms = numRooms;
    
    var totalFoods = 0;
    
    //create rooms
    this.mazeArray.forEach(function (rows, row) {
      rooms.push([]);
      rows.forEach(function (protoRoom, col) {
        var roomRand = rng(protoRoom);
        var room = {
          type: protoRoom,
          foodSeed: roomRand.int(),
          enemySeed: roomRand.int(),
          left: null,
          top: null,
          right: null,
          bottom: null,
          outerAABB: null,
          innerAABB: null,
          wallAABBs: [],
          enemies: [],
          endAABB: null,
          foods: [],
          numFoods: 0
        };
        if (protoRoom) {
          room.outerAABB = new AABB({
            x: col * roomSizeAABB.getWidth(),
            y: row * roomSizeAABB.getHeight(),
            hw: roomSizeAABB.hw,
            hh: roomSizeAABB.hh
          });
          room.innerAABB = new AABB({
            x: col * roomSizeAABB.getWidth(),
            y: row * roomSizeAABB.getHeight(),
            hw: innerRoomSizeAABB.hw,
            hh: innerRoomSizeAABB.hh
          });
          if (protoRoom >= minRandType) {
            var foods = mazeRand.range(12, 14);
            room.numFoods = foods;
            totalFoods += foods;
          }
        }
        rooms[row].push(room);
      });
    });
    
    //fuds
    this.totalFoods = totalFoods;
    this.requiredFoods = Math.floor(totalFoods * 0.7);
    
    //determine connections
    rooms.forEach(function (rows, row) {
      rows.forEach(function (room, col) {
        if (col > 0 && rooms[row][col - 1].type) {
          room.left = rooms[row][col - 1];
        }
        if (col < rows.length - 1 && rooms[row][col + 1].type) {
          room.right = rooms[row][col + 1];
        }
        if (row > 0 && rooms[row - 1][col].type) {
          room.top = rooms[row - 1][col];
        }
        if (row < rooms.length - 1 && rooms[row + 1][col].type) {
          room.bottom = rooms[row + 1][col];
        }
      });
    });
    
    this.rooms = rooms;
  },
  traverseRooms: function (fn) {
    var rooms = this.rooms;
    rooms.forEach(function (rows, row) {
      rows.forEach(function (room, col) {
        fn(room, col, row, rows, rooms);
      });
    });
  }
});

Maze.generate = function (options) {
  var opts = extend({
    seed: 0,
    roomSizeAABB: null,
    innerRoomSizeAABB: null,
    doorWidth: 0
  }, options || {});
  var rand = rng(opts.seed);
  var roomsApart = rand.range(4, 7);
  var fillerRooms = rand.range(5, 10);
  var start = new Vec2(0, 0);
  var mazeTree = [start];
  var possibleDirs = rand.pick([
    [ new Vec2(-1, 0), new Vec2(0, -1) ],
    [ new Vec2(-1, 0), new Vec2(0, 1) ],
    [ new Vec2(1, 0), new Vec2(0, 1) ],
    [ new Vec2(1, 0), new Vec2(0, -1) ]
  ]);
  var connectionTree = {};
  connectionTree[start.y] = {};
  connectionTree[start.y][start.x] = true;
  var nonLandLocked = [start];
  var i, j, dir, next;
  //generate shortest path
  for (i = 0; i < roomsApart; i++) {
    dir = rand.pick(possibleDirs);
    next = new Vec2(mazeTree[i].x + dir.x, mazeTree[i].y + dir.y);
    mazeTree.push(next);
    nonLandLocked.push(next); //impossible to generate landlocked rooms at this point
    if (!connectionTree[next.y]) {
      connectionTree[next.y] = {};
    }
    connectionTree[next.y][next.x] = true;
  }
  var end = next;
  //filler rooms
  var room;
  for (i = 0; i < fillerRooms; i++) {
    var open = [], room = rand.pick(nonLandLocked);
    if (!connectionTree[room.y - 1]) {
      connectionTree[room.y - 1] = {};
    }
    if (!connectionTree[room.y + 1]) {
      connectionTree[room.y + 1] = {};
    }
    if (!connectionTree[room.y][room.x - 1]) {
      open.push(new Vec2(room.x - 1, room.y));
    }
    if (!connectionTree[room.y][room.x + 1]) {
      open.push(new Vec2(room.x + 1, room.y));
    }
    if (!connectionTree[room.y - 1][room.x]) {
      open.push(new Vec2(room.x, room.y - 1));
    }
    if (!connectionTree[room.y + 1][room.x]) {
      open.push(new Vec2(room.x, room.y + 1));
    }
    next = rand.pick(open);
    mazeTree.push(next);
    //last one taken, so it's now landlocked
    if (open.length === 1) {
      nonLandLocked.splice(nonLandLocked.indexOf(room), 1);
    }
    //register in connection tree
    connectionTree[next.y][next.x] = true;
    //check if new room not landlocked
    if (!connectionTree[next.y - 1]) {
      connectionTree[next.y - 1] = {};
    }
    if (!connectionTree[next.y + 1]) {
      connectionTree[next.y + 1] = {};
    }
    if (!(connectionTree[next.y][next.x - 1]
          && connectionTree[next.y][next.x + 1]
          && connectionTree[next.y - 1][next.x]
          && connectionTree[next.y + 1][next.x]
         )) {
      nonLandLocked.push(next);
    }
    //recheck nonLandLocked rooms to ensure they're not landlocked
    var j, r;
    for (j = nonLandLocked.length - 1; j >= 0; j--) {
      r = nonLandLocked[j];
      if (!connectionTree[r.y - 1]) {
        connectionTree[r.y - 1] = {};
      }
      if (!connectionTree[r.y + 1]) {
        connectionTree[r.y + 1] = {};
      }
      if (connectionTree[r.y][r.x - 1]
          && connectionTree[r.y][r.x + 1]
          && connectionTree[r.y - 1][r.x]
          && connectionTree[r.y + 1][r.x]) {
        nonLandLocked.splice(j, 1);
      }
    }
  }
  //determine bounds
  var bounds = { left: 0, top: 0, right: 0, bottom: 0 };
  mazeTree.forEach(function (room) {
    if (room.y < bounds.top) {
      bounds.top = room.y;
    }
    if (room.y > bounds.bottom) {
      bounds.bottom = room.y;
    }
    if (room.x < bounds.left) {
      bounds.left = room.x;
    }
    if (room.x > bounds.right) {
      bounds.right = room.x;
    }
  });
  
  //generate mazeArr from mazeTree
  var mazeRows = bounds.bottom - bounds.top + 1;
  var mazeCols = bounds.right - bounds.left + 1;
  var mazeArr = [];
  for (i = 0; i < mazeRows; i++) {
    mazeArr.push([]);
    for (j = 0; j < mazeCols; j++) {
      mazeArr[i].push(0);
    }
  }
  mazeTree.forEach(function (room) {
    var row = -bounds.top + room.y,
        col = -bounds.left + room.x;
    mazeArr[row][col] = start.equals(room) ? startType : end.equals(room) ? endType : rand.int(0xfffffff - minRandType) + minRandType;
  });
  return new Maze({
    seed: opts.seed,
    mazeArray: mazeArr,
    roomSizeAABB: opts.roomSizeAABB,
    innerRoomSizeAABB: opts.innerRoomSizeAABB,
    doorWidth: opts.doorWidth
  });
};

module.exports = Maze;
