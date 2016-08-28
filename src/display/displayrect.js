var DisplayItem = require('./displayitem'),
    AABB = require('../math/aabb'),
    inherit = require('../util/inherit');

function DisplayRect(options) {
  DisplayItem.apply(this, arguments);
  this.applyOptions({
    color: '#ffffff'
  }, options);
  this.aabb = new AABB(this.aabb || this.rect || {
    hw: this.hw || 0,
    hh: this.hh || 0
  });
}
DisplayRect.prototype = inherit(DisplayItem, {
  render: function (elapsed) {
    var ctx = this.stage.ctx;
    ctx.beginPath();
    ctx.rect(
      this.aabb.getLeft(),
      this.aabb.getTop(),
      this.aabb.getWidth(),
      this.aabb.getHeight()
    );
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
});

module.exports = DisplayRect;