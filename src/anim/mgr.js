
function AnimMgr() {
  this.anims = [];
  this.logicAnims = [];
}

AnimMgr.prototype = {
  run: function (anim) {
    if (anim.useLogicTime) {
      this.logicAnims.push(anim);
    } else {
      this.anims.push(anim);
    }
  },
  update: function (elapsed, usingLogicTime) {
    var anims = usingLogicTime ? this.logicAnims : this.anims;
    var animsToRemove = [];
    anims.forEach(function (anim, i) {
      anim.update(elapsed);
      if (anim.hasEnded()) {
        animsToRemove.push(i);
      }
    });
    var i;
    for (i = animsToRemove.length - 1; i >= 0; i--) {
      anims.splice(animsToRemove[i], 1);
    }
  }
};

module.exports = new AnimMgr();
