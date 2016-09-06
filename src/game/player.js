var DisplayContainer = require('../display/displaycontainer'),
    DisplayRect = require('../display/displayrect'),
    AABB = require('../math/aabb'),
    inherit = require('../util/inherit'),
    extend = require('../util/extend');

function Player(options) {
  DisplayContainer.call(this, extend({
    collisionSizeAABB: new AABB()
  }, options || {}));
  this.collisionAABB = this.collisionSizeAABB.copy();
  this.collisionAABB.x = this.x;
  this.collisionAABB.y = this.y;
  this.oldCollisionAABB = this.collisionAABB.copy();
  this.addChild(new DisplayRect({
    x: 0,
    y: 0,
    aabb: this.collisionSizeAABB.copy(),
    color: '#ffffff'
  }));
}

Player.prototype = inherit(DisplayContainer, {
  update: function (elapsed) {
    DisplayContainer.prototype.update.apply(this, arguments);
    var player = this;
    player.oldCollisionAABB.x = player.collisionAABB.x;
    player.oldCollisionAABB.y = player.collisionAABB.y;
    player.collisionAABB.x = player.x;
    player.collisionAABB.y = player.y;
  }
});

module.exports = Player;
