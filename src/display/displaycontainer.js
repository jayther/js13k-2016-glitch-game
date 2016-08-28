var DisplayItem = require('./displayitem'),
    inherit = require('../util/inherit');

function DisplayItemContainer(options) {
  DisplayItem.apply(this, arguments);
  this.applyOptions({
    isStage: false
  }, options);
  this.children = [];
  if (this.isStage) {
    this.stage = this;
  }
}
DisplayItemContainer.prototype = inherit(DisplayItem, {
  render: function (elapsed) {
    this.children.forEach(function (child) {
      child.stageRender(elapsed);
    });
  },
  addChild: function (child) {
    this.children.push(child);
    child.parent = this;
    child.stage = this.stage;
  },
  removeChild: function (child) {
    var index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      child.parent = null;
      child.stage = null;
    }
  },
  removeChildAt: function (index) {
    this.children[index].parent = null;
    this.children[index].stage = null;
    this.children.splice(index, 1);
  }
});

module.exports = DisplayItemContainer;
