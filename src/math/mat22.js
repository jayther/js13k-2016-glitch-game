var Vec2 = require('./vec2');

function Mat22() {
  this.col1 = new Vec2(1, 0);
  this.col2 = new Vec2(0, 1);
}

Mat22.prototype = Object.create({
  addM: function (m) {
    this.col1.x += m.col1.x;
    this.col1.y += m.col1.y;
    this.col2.x += m.col2.x;
    this.col2.y += m.col2.y;
  },
  getAngle: function () {
    return Math.atan2(this.col1.y, this.col1.x);
  },
  setAngle: function (angle) {
    var c = Math.cos(angle),
        s = Math.sin(angle);
    
    this.col1.x = c; this.col2.x = -s;
    this.col1.y = s; this.col2.y = c;
  },
  set: function (m) {
    this.col1.x = m.col1.x;
    this.col1.y = m.col1.y;
    this.col2.x = m.col2.x;
    this.col2.y = m.col2.y;
  },
  copy: function () {
    var m = new Mat22();
    m.set(this);
    return m;
  }
});

module.exports = Mat22;
