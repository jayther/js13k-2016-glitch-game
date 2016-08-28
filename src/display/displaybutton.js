var inherit = require('../util/inherit'),
    DisplayContainer = require('./displaycontainer'),
    AABB = require('../math/aabb');

function DisplayButton(options) {
  DisplayContainer.apply(this, options);
  this.applyOptions({
    click: function (e) { console.log('missing click callback'); }
  }, options);
  if (this.hasOwnProperty('width') && this.hasOwnProperty('height')) {
    this.aabb = new AABB({
      x: this.width / 2,
      y: this.height / 2,
      hw: this.width / 2,
      hh: this.height / 2
    });
  } else {
    this.aabb = new AABB(this.aabb || this.rect || {
      hw: this.hw || 0,
      hh: this.hh || 0
    });
  }
  this.isButton = true;
}
DisplayButton.prototype = inherit(DisplayContainer, {
  
});

module.exports = DisplayButton;
