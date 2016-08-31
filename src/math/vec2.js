function Vec2(x, y) {
  this.x = x;
  this.y = y;
}

Vec2.prototype = Object.create({
  add: function (v) {
    this.x += v.x;
    this.y += v.y;
  },
  subtract: function (v) {
    this.x -= v.x;
    this.y -= v.y;
  },
  multiply: function (a) {
    this.x *= a;
    this.y *= a;
  },
  mulM: function (a) {
    var tx = this.x;
    this.x = a.col1.x * tx + a.col2.x * this.y;
    this.y = a.col1.y * tx + a.col2.y * this.y;
  },
  length: function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },
  length2: function () {
    return this.x * this.x + this.y * this.y;
  },
  normalize: function () {
    var invLen = 1.0 / this.length();
    this.x *= invLen;
    this.y *= invLen;
  },
  copy: function () {
    return new Vec2(this.x, this.y);
  },
  setAngle: function (angle) {
    this.x = Math.cos(angle);
    this.y = Math.sin(angle);
  },
  equals: function (v) {
    return this.x === v.x && this.y === v.y;
  }
});

module.exports = Vec2;
