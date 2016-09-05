var inherit = require('../util/inherit'),
    Dispatcher = require('../event/dispatcher');

function KBMgr() {
  Dispatcher.apply(this, arguments);
  this.keys = {};
  window.addEventListener('keydown', this.triggerDown.bind(this), false);
  window.addEventListener('keyup', this.triggerUp.bind(this), false);
}

KBMgr.prototype = inherit(Dispatcher, {
  triggerDown: function (e) {
    this.keys[e.keyCode] = true;
    this.dispatch('keydown', {
      keyCode: e.keyCode
    });
    e.preventDefault();
  },
  triggerUp: function (e) {
    this.keys[e.keyCode] = false;
    this.dispatch('keyup', {
      keyCode: e.keyCode
    });
    e.preventDefault();
  }
});

module.exports = new KBMgr();
