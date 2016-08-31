var extend = require('./extend');

function Appliable() {
}
Appliable.prototype = {
  applyOptions: function (defaults, options) {
    extend(this, extend(defaults || {}, options || {}));
  }
};

module.exports = Appliable;
