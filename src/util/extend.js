module.exports = function (obj, props) {
  for (var prop in props) {
    if (props.hasOwnProperty(prop)) {
      obj[prop] = props[prop];
    }
  }
  return obj;
};