// Dude's Pockets

define(['Inventory'], function (Inventory) {

  var inHand = null;

  var inventory = new Inventory(9, 3);

  inventory.putInHand = function (item) {
    inHand = item;
    this.fireEvent('itemPutInHand', item);
  };

  inventory.removeFromHand = function () {
    this.fireEvent('itemRemovedFromHand', inHand);
    inHand = null;
  };

  inventory.inHand = function () {
    return inHand;
  };

  return inventory;
});
