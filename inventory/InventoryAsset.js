// InventoryAsset

define(['game'], function (game) {

  var inventoryAsset = function (object, width, height, image) {
    object.prototype.width = width;
    object.prototype.height = height;
    game.assetManager.load('inventory/' + image, function (image) {
      object.prototype.image = image;
    });
  };

  return inventoryAsset;
});
