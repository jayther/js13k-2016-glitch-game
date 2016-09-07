var Anim = require('./anim'),
    inherit = require('../util/inherit'),
    extend = require('../util/extend');

function AnimSequence(options) {
  Anim.call(this, extend({
    anims: []
  }, options || {}));
  var duration = 0;
  this.anims.forEach(function (anim) {
    anim.startTime = duration;
    anim.endTime = anim.startTime + anim.duration;
    duration += anim.duration;
  });
  this.duration = duration;
  this.currentIndex = 0;
}
AnimSequence.prototype = inherit(Anim, {
  update: function (elapsed) {
    Anim.prototype.update.apply(this, arguments);
    var anim, rerun, currentElapsed = elapsed;
    do {
      anim = this.anims[this.currentIndex];
      rerun = false;
      if (anim) {
        if (this.currentTime >= anim.startTime && this.currentTime < anim.endTime) {
          anim.update(currentElapsed);
        } else if (this.currentTime >= anim.endTime) {
          anim.currentTime = anim.endTime;
          anim.update(0);
          currentElapsed = this.currentTime - anim.endTime;
          this.currentIndex++;
          rerun = true;
        }
      }
    } while (rerun);
  }
});

module.exports = AnimSequence;
