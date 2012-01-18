// Dude's Hands

define(['Inventory'], function (Inventory) {
  var methods = {
    // everything goes in the top slot
    isAvailable: function (item, x, y) {
      return Inventory.prototype.isAvailable.call(this, item, x, 0);
    },

    // ditto
    addItem: function (item, x, y) {
      return Inventory.prototype.addItem.call(this, item, x, 0);
    },

    leftHand: function () {
      return this.itemAt(0, 0);
    },

    rightHand: function () {
      return this.itemAt(1, 0);
    },

    // return the first weapon we're carrying
    // start with the right hand
    weapon: function () {
      for (var i = 1; i >= 0; i--) {
        var hand = this.itemAt(i, 0);
        if (hand && hand.damage) {
          return hand;
        }
      }
    },

    hasAimableItem: function () {
      for (var i = 0; i < 2; i++) {
        var item = this.itemAt(i, 0);
        if (item && item.aimable) {
          return true;
        }
      }
      return false;
    },

    renderItems: function (dude) {
      for (var i = 0; i < 2; i++) {
        var item = this.itemAt(i, 0);
        if (item && item.render) {
          item.render(dude);
        }
      }
    }
  };

  var DudeHands = function () {
    // return a new inventory object with the extended methods
    return _.extend(new Inventory({width:2, height:3}), methods);
  };

  return DudeHands;
});
