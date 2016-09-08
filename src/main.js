var raf = require('./raf'),
    Vec2 = require('./math/vec2'),
    AABB = require('./math/aabb'),
    cursorMgr = require('./input/cursormgr'),
    kbMgr = require('./input/kbmgr'),
    animMgr = require('./anim/mgr'),
    DisplayRect = require('./display/displayrect'),
    PlayStage = require('./game/playstage'),
    Player = require('./game/player');

var canvas = document.querySelector('#game');
var ctx = canvas.getContext('2d');
ctx.font = '30px Arial';

var player = null;
var bullets = [];
var currentRoom = null;
var colors = [
  '#7FDBFF', '#0074D9', '#01FF70', '#001F3F', '#39CCCC',
  '#3D9970', '#2ECC40', '#FF4136', '#85144B', '#FF851B',
  '#B10DC9', '#FFDC00', '#F012BE',
];
var playerSpeed = 200;

var logicAccumulator = 0;
var logicFrameRate = 1 / 30;
var logicMaxSteps = 5;

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

cursorMgr.areaTarget = canvas;

var dispatchToCurrentStage = function (e) {
  currentStage.dispatch(e.name, e.data);
};

cursorMgr.on('cursordown', dispatchToCurrentStage);
cursorMgr.on('cursorup', dispatchToCurrentStage);

kbMgr.on('keydown', dispatchToCurrentStage);
kbMgr.on('keyup', dispatchToCurrentStage);

player = new Player({
  x: canvas.width / 2,
  y: canvas.height / 2,
  collisionSizeAABB: new AABB({
    hw: 20,
    hh: 20
  }),
  maxSpeed: playerSpeed
});

function restartPlayStage(e) {
  if (player.parent) {
    player.parent.removeChild(player);
  }
  player.reset();
  var playStage = new PlayStage({
    ctx: ctx,
    viewSizeAABB: canvasAABB,
    roomSizeAABB: canvasAABB,
    innerRoomSizeAABB: innerRoomAABB,
    doorWidth: doorWidth,
    player: player,
    level: e ? e.data.level : 0
  });
  playStage.on('restart', restartPlayStage);
  currentStage = playStage;
  playStage.fadeIn();
}

restartPlayStage();

/*var testButton = new DisplayButton({
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
testButton.addChild(testButtonText);*/

function render(elapsed) {
  // Clear the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  currentStage.preRender(elapsed);
  currentStage.render(elapsed);
  currentStage.postRender(elapsed);
}
function logicUpdate(elapsed) {
  var i;
  currentStage.update(elapsed);
  
}

raf.start(function(elapsed) {
  var i;
  logicAccumulator += elapsed;
  for (i = 0; i < logicMaxSteps && logicAccumulator >= logicFrameRate; i += 1) {
    logicUpdate(logicFrameRate);
    animMgr.update(logicFrameRate);
    logicAccumulator -= logicFrameRate;
  }
  if (logicAccumulator >= logicFrameRate) {
    logicAccumulator -= Math.floor(logicAccumulator / logicFrameRate) * logicFrameRate;
  }
  render(elapsed);
});
