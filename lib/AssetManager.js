// AssetManager

define([], function () {
  var AssetManager = function (base) {
    var images      = {};

    var loadImage = function (name, callback) {
      if (images[name]) {
        if (callback) {
          callback(images[name]);
        }
      } else {
        var image = new Image();
        if (callback) {
          image.onload = function () {
            callback(image);
          };
        }
        image.src = base + name + '.png';
      }
    };

    return {
      loadImage: loadImage
    };
  };

  return AssetManager;
});
