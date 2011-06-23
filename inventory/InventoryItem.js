// InventoryItem

define(function () {

  var InventoryItem = function (object, config) {
    object.prototype.width = config.width;
    object.prototype.height = config.height;
    object.prototype.image = 'assets/inventory/' + config.image + '.png';
    object.x = null;
    object.y = null;
  };

  return InventoryItem;
});
