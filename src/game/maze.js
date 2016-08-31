var inherit = require('../util/inherit'),
    Vec2 = require('../math/vec2'),
    Appliable = require('../util/appliable'),
    rng = require('../rng');

function Maze(options) {
  this.applyOptions({
    seed: 0,
    mazeArray: []
  }, options);
}

Maze.generate = function (seed) {
  var rand = rng(seed);
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
  var i, j, dir, next;
  //generate shortest path
  for (i = 0; i < roomsApart; i++) {
    dir = rand.pick(possibleDirs);
    next = new Vec2(mazeTree[i].x + dir.x, mazeTree[i].y + dir.y);
    mazeTree.push(next);
  }
  var end = next;
  //filler rooms
  /*for (i = 0; i < fillerRooms; i++) {
    
  }*/
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
    mazeArr[-bounds.top + room.y][-bounds.left + room.x] = start.equals(room) ? 1 : end.equals(room) ? 2 : rand.range(3, 10);
  });
  return new Maze({
    seed: seed,
    mazeArray: mazeArr
  });
};

Maze.prototype = inherit(Appliable, {
});

module.exports = Maze;
