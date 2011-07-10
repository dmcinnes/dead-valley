// Dude's Hands

define(['Inventory'], function (Inventory) {
  var DudeHands = function () {
  };
  DudeHands.prototype = new Inventory(2, 3);

  // everything goes in the top slot
  DudeHands.prototype.isAvailable = function (item, x, y) {
    return Inventory.prototype.isAvailable.call(this, item, x, 0);
  };

  // ditto
  DudeHands.prototype.addItem = function (item, x, y) {
    return Inventory.prototype.addItem.call(this, item, x, 0);
  };

  DudeHands.prototype.leftHand = function () {
    return this.itemAt(0, 0);
  };

  DudeHands.prototype.rightHand = function () {
    return this.itemAt(1, 0);
  };

  // return the first weapon we're carrying
  // start with the right hand
  DudeHands.prototype.weapon = function () {
    for (var i = 1; i >= 0; i--) {
      var hand = this.itemAt(i, 0);
      if (hand && hand.damage) {
        return hand;
      }
    }
  };

  DudeHands.prototype.hasAimableItem = function () {
    for (var i = 0; i < 2; i++) {
      var item = this.itemAt(i, 0);
      if (item && item.aimable) {
        return true;
      }
    }
    return false;
  };

  DudeHands.prototype.renderItems = function (dude) {
    for (var i = 0; i < 2; i++) {
      var item = this.itemAt(i, 0);
      if (item && item.render) {
        item.render(dude);
      }
    }
  };

  return DudeHands;
});
