var DisplayItem = require('./displayitem'),
    Vec2 = require('../math/vec2'),
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
  this.buttons = [];
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
    if (child.isButton) {
      this.stage.addButton(child);
    }
  },
  removeChild: function (child) {
    var index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      child.parent = null;
      child.stage = null;
    }
    if (child.isButton) {
      this.stage.removeButton(child);
    }
  },
  removeChildAt: function (index) {
    var child = this.children[index];
    child.parent = null;
    child.stage = null;
    this.children.splice(index, 1);
    if (child.isButton) {
      this.stage.removeButton(child);
    }
  },
  addButton: function (button) {
    this.buttons.push(button);
  },
  removeButton: function (button) {
    var index = this.buttons.indexOf(child);
    if (index >= 0) {
      this.buttons.splice(index, 1);
    }
  }
});

module.exports = DisplayItemContainer;
