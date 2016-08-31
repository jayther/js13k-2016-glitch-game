var extend = require('./extend');

module.exports = function () {
  var obj = null, cur, args = Array.prototype.slice.call(arguments);
  args.forEach(function (arg, i) {
    cur = arg.prototype ? arg.prototype : arg;
    obj = obj ? extend(obj, cur) : Object.create(cur);
  });
  return obj;
};
