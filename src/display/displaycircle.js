var DisplayItem = require('./displayitem'),
    inherit = require('../util/inherit');

function DisplayCircle(options) {
  DisplayItem.apply(this, arguments);
  this.applyOptions({
    radius: 10,
    color: '#000000'
  }, options);
}
DisplayCircle.prototype = inherit(DisplayItem, {
  render: function (elapsed) {
    var ctx = this.stage.ctx;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
});

module.exports = DisplayCircle;