var inherit = require('../util/inherit'),
    Appliable = require('../util/appliable');

function AABB(options) {
  this.applyOptions({
    x: 0,
    y: 0,
    hw: 0,
    hh: 0
  }, options);
}
AABB.prototype = inherit(Appliable, {
  getWidth: function () {
    return this.hw * 2;
  },
  getHeight: function () {
    return this.hh * 2;
  },
  getLeft: function () {
    return this.x - this.hw;
  },
  getTop: function () {
    return this.y - this.hh;
  },
  getRight: function () {
    return this.x + this.hw;
  },
  getBottom: function () {
    return this.y + this.hh;
  },
  collidesAABB: function (aabb) {
    return Math.abs(this.x - aabb.x) < (this.hw + aabb.hw) &&
      Math.abs(this.y - aabb.y) < (this.hh + aabb.hh);
  },
  contains: function (x, y) {
    return x >= this.getLeft() && x < this.getRight() &&
      y >= this.getTop() && y < this.getBottom();
  },
  copy: function () {
    return new AABB(this);
  }
});
AABB.createRect = function (options) {
  var opts = options || {},
      left = opts.left || opts.x || 0,
      top = opts.top || opts.y || 0,
      right = opts.right || 0,
      bottom = opts.bottom || 0;
  if (opts.hasOwnProperty('width')) {
    right = left + opts.width;
  }
  if (opts.hasOwnProperty('height')) {
    bottom = top + opts.height;
  }
  return new AABB({
    x: (left + right) / 2,
    y: (top + bottom) / 2,
    hw: (right - left) / 2,
    hh: (bottom - top) / 2
  });
};

module.exports = AABB;
