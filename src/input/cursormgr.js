var inherit = require('../util/inherit'),
    Vec2 = require('../math/vec2'),
    Appliable = require('../util/appliable'),
    Dispatcher = require('../event/dispatcher');

function CursorMgr(options) {
  Dispatcher.apply(this, arguments);
  this.applyOptions({
    areaTarget: null
  }, options);
  this.vec = new Vec2(0, 0);

  window.addEventListener('mousedown', this.triggerDown.bind(this), false);
  window.addEventListener('mousemove', this.triggerMove.bind(this), false);
  window.addEventListener('mouseup', this.triggerUp.bind(this), false);
}
CursorMgr.prototype = inherit(Dispatcher, Appliable, {
  triggerDown: function (e) {
    this.dispatch('cursordown', this.vec.copy());
    e.preventDefault();
  },
  triggerMove: function (e) {
    var rect = this.areaTarget.getBoundingClientRect();
    this.dispatch('cursormove', this.vec.copy());
    this.vec.x = Math.floor(e.pageX - rect.left);
    this.vec.y = Math.floor(e.pageY - rect.top);
    e.preventDefault();
  },
  triggerUp: function (e) {
    this.dispatch('cursorup', this.vec.copy());
    e.preventDefault();
  }
});

module.exports = CursorMgr;
