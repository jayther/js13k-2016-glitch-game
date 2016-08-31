
function EventDispatcher() {
  this.eventMap = {};
}
EventDispatcher.prototype = {
  ensureMap: function (name) {
    if (!this.eventMap[name]) {
      this.eventMap[name] = [];
    }
  },
  on: function (name, fn) {
    this.ensureMap(name);
    this.eventMap[name].push(fn);
  },
  dispatch: function (name, data) {
    if (this.eventMap[name]) {
      this.eventMap[name].forEach(function (fn) {
        fn({
          name: name,
          data: data,
          source: this
        });
      });
    }
  }
};

module.exports = EventDispatcher;
