var Anim = require('./anim'),
    inherit = require('../util/inherit'),
    extend = require('../util/extend');

function AnimGroup(options) {
  Anim.call(this, extend({
    anims: []
  }, options || {}));
  
  var duration = 0;
  this.anims.forEach(function (anim) {
    if (anim.duration > duration) {
      duration = anim.duration;
    }
  });
  this.duration = duration;
}

AnimGroup.prototype = inherit(Anim, {
  update: function (elapsed) {
    Anim.prototype.update.apply(this, arguments);
    this.anims.forEach(function (anim) {
      anim.update(elapsed);
    });
  }
});
