var inherit = require('../util/inherit'),
    Appliable = require('../util/appliable');

function DisplayItem(options) {
  this.applyOptions({
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    visible: true,
    opacity: 1,
    angle: 0,
    anchorX: 0,
    anchorY: 0,
    scaleX: 1,
    scaleY: 1
  }, options);
  this.parent = null;
}
DisplayItem.prototype = inherit(Appliable, {
  update: function (elapsed) {
    this.x += this.dx * elapsed;
    this.y += this.dy * elapsed;
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
  }
});

module.exports = DisplayItem;
