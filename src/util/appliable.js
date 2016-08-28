var extend = require('./extend');

function Appliable() {
}
Appliable.prototype = Object.create({
  applyOptions: function (defaults, options) {
    extend(this, extend(defaults || {}, options || {}));
  }
});

module.exports = Appliable;
