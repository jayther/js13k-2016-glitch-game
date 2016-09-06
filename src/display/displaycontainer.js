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
  this.buttonDowned = null;
  this.on('cursordown', this.triggerMouseDown.bind(this));
  this.on('cursorup', this.triggerMouseUp.bind(this));
}
DisplayItemContainer.prototype = inherit(DisplayItem, {
  setStage: function (stage) {
    this.stage = stage;
    this.children.forEach(function (child) {
      child.stage = stage;
    });
  },
  render: function (elapsed) {
    this.children.forEach(function (child) {
      child.stageRender(elapsed);
    });
  },
  addChild: function (child) {
    this.children.push(child);
    child.parent = this;
    child.setStage(this.stage);
    if (child.isButton) {
      this.stage.addButton(child);
    }
  },
  removeChild: function (child) {
    var index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      child.parent = null;
      child.setStage(null);
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
  },
  getDownedButton: function (x, y) {
    var i;
    for (i = this.buttons.length - 1; i >= 0; i--) {
      var button = this.buttons[i];
      if (button.isStageVisible()) {
        var stagePos = button.getStagePos();
        if (button.aabb.contains(x - stagePos.x, y - stagePos.y)) {
          return button;
        }
      }
    }
  },
  triggerMouseDown: function (e) {
    if (!this.buttonDowned) {
      this.buttonDowned = this.getDownedButton(e.data.x, e.data.y);
    }
  },
  triggerMouseUp: function (e) {
    if (this.buttonDowned) {
      var stagePos = this.buttonDowned.getStagePos();
      if (this.buttonDowned.aabb.contains(e.data.x - stagePos.x, e.data.y - stagePos.y)) {
        this.buttonDowned.click(e.data);
      }
      this.buttonDowned = null;
    }
  }
});

module.exports = DisplayItemContainer;
