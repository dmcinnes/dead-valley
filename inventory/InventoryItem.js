// InventoryItem

define(function () {

  var InventoryItem = function (object, config) {
    object.prototype.width  = config.width;
    object.prototype.height = config.height;
    object.prototype.image  = 'assets/inventory/' + config.image + '.png';

    if (!object.prototype.displayNode) {
      var display = $("<img/>").attr('src', object.prototype.image);
      object.prototype.displayNode = function () {
        return display;
      };
    }

    object.x = null;
    object.y = null;
  };

  return InventoryItem;
});
