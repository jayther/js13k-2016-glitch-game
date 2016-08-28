var inherit = require('../util/inherit'),
    DisplayItem = require('./displayitem');

function DisplayText(options) {
  DisplayItem.apply(this, arguments);
  this.applyOptions({
    text: 'meow',
    textAlign: 'left',
    textBaseline: 'top',
    font: null,
    color: '#000000'
  }, options);
}

DisplayText.prototype = inherit(DisplayItem, {
  render: function (elapsed) {
    var ctx = this.stage.ctx;
    if (this.font) {
      ctx.font = this.font;
    }
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = this.textBaseline;
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, 0, 0);
  }
});

module.exports = DisplayText;
