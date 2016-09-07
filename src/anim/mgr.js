
function AnimMgr() {
  this.anims = [];
}

AnimMgr.prototype = {
  run: function (anim) {
    this.anims.push(anim);
  },
  update: function (elapsed) {
    var animsToRemove = [];
    this.anims.forEach(function (anim, i) {
      anim.update(elapsed);
      if (anim.hasEnded()) {
        animsToRemove.push(i);
      }
    });
    var i;
    for (i = animsToRemove.length - 1; i >= 0; i--) {
      this.anims.splice(animsToRemove[i], 1);
    }
  }
};

module.exports = new AnimMgr();
