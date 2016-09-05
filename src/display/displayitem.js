var inherit = require('../util/inherit'),
    Vec2 = require('../math/vec2'),
    Appliable = require('../util/appliable'),
    Dispatcher = require('../event/dispatcher');

function DisplayItem(options) {
  Dispatcher.apply(this, arguments);
  this.applyOptions({
    x: 0,
    y: 0,
    visible: true,
    opacity: 1,
    angle: 0,
    anchorX: 0,
    anchorY: 0,
    scaleX: 1,
    scaleY: 1
  }, options);
  this.parent = null;
  this.isButton = false;
  this.vel = new Vec2();
  this.accel = new Vec2();
}
DisplayItem.prototype = inherit(Dispatcher, Appliable, {
  update: function (elapsed) {
    this.vel.x += this.accel.x * elapsed;
    this.vel.y += this.accel.y * elapsed;
    this.x += this.vel.x * elapsed;
    this.y += this.vel.y * elapsed;
  },
  stageRender: function (elapsed) {
    this.preRender(elapsed);
    this.render(elapsed);
    this.postRender(elapsed);
  },
  preRender: function (elapsed) {
    var ctx = this.stage.ctx;
    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.translate(-this.anchorX, -this.anchorY);
  },
  render: function (elapsed) {
  },
  postRender: function (elapsed) {
    this.stage.ctx.restore();
  },
  isStageVisible: function () {
    if (!this.parent) {
      return this.visible;
    }
    var stageVisible = this.parent.isStageVisible();
    return stageVisible && this.visible;
  },
  getStagePos: function () {
    if (this.parent) {
      var pos = this.parent.getStagePos();
      pos.x += this.x;
      pos.y += this.y;
      return pos;
    }
    return new Vec2(this.x, this.y);
  }
});

module.exports = DisplayItem;
