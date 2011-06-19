// InventoryItem

define(function () {

  var InventoryItem = function (object, width, height, image) {
    object.prototype.width = width;
    object.prototype.height = height;
    object.prototype.image = 'assets/inventory/' + image + '.png';
    object.x = null;
    object.y = null;
  };

  return InventoryItem;
});
