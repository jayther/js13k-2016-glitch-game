var inherit = require('../util/inherit'),
    Appliable = require('../util/appliable');

var timingFunctions = {
  linear: function (t) { return t; },
  easeInCubic: function (t) { return t*t*t; },
  easeOutCubic: function (t) { return (--t)*t*t+1; },
  easeInOutCubic: function (t) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; }
};

function Anim(options) {
  this.applyOptions({
    target: null,
    prop: null,
    duration: 0,
    start: null,
    end: null,
    timingFunction: timingFunctions.linear,
    callback: null
  }, options);
  this.currentTime = 0;
  this.viable = this.target && this.prop !== null && this.start !== null && this.end !== null;
}
Anim.timingFunctions = timingFunctions;
Anim.prototype = inherit(Appliable, {
  update: function (elapsed) {
    this.currentTime += elapsed;
    if (this.viable) {
      var ratio = this.currentTime / this.duration;
      if (ratio > 1) {
        ratio = 1;
      }
      this.step(ratio);
    }
    if (this.callback && this.currentTime >= this.duration) {
      this.callback();
    }
  },
  step: function (ratio) {
    this.target[this.prop] = this.start + (this.end - this.start) * this.timingFunction(ratio);
  },
  hasEnded: function () {
    return this.currentTime >= this.duration;
  }
});

module.exports = Anim;
