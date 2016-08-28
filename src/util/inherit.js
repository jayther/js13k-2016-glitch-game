var extend = require('./extend');

module.exports = function () {
  var obj = null, cur;
  for (var i = 0; i < arguments.length; i += 1) {
    cur = arguments[i].prototype ? Object.create(arguments[i].prototype) : arguments[i];
    if (obj) {
      obj = extend(obj, cur);
    } else {
      obj = cur;
    }
  }
  return obj;
};
