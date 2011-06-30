// Dude's Hands

define(['Inventory'], function (Inventory) {
  var inventory = new Inventory(2, 3);

  // everything goes in the top slot
  inventory.isAvailable = function (item, x, y) {
    return Inventory.prototype.isAvailable.call(this, item, x, 0);
  };

  // ditto
  inventory.addItem = function (item, x, y) {
    Inventory.prototype.addItem.call(this, item, x, 0);
  };

  inventory.leftHand = function () {
    return inventory.itemAt(0, 0);
  };

  inventory.rightHand = function () {
    return inventory.itemAt(1, 0);
  };

  // return the first weapon we're carrying
  // start with the right hand
  inventory.weapon = function () {
    for (var i = 1; i >= 0; i--) {
      var hand = inventory.itemAt(i, 0);
      if (hand && hand.damage) {
        return hand;
      }
    }
  };

  inventory.hasAimableItem = function () {
    for (var i = 0; i < 2; i++) {
      var item = inventory.itemAt(i, 0);
      if (item && item.aimable) {
        return true;
      }
    }
    return false;
  };

  inventory.renderItems = function (dude) {
    for (var i = 0; i < 2; i++) {
      var item = inventory.itemAt(i, 0);
      if (item && item.render) {
        item.render(dude);
      }
    }
  };

  return inventory;
});
