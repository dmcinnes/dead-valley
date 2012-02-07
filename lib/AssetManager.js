// AssetManager

define(['Progress'], function (Progress) {
  var AssetManager = function (base) {
    var images      = {};

    var loadImage = function (name, callback) {
      if (images[name]) {
        if (callback) {
          callback(images[name]);
        }
      } else {
        Progress.addTarget();
        var image = new Image();
        image.onload = function () {
          if (callback) {
            callback(image);
          }
          Progress.increment();
        };
        image.onerror = function () {
          console.error("failed to load image " + name);
          Progress.increment();
        };
        image.src = base + name + '.png';
      }
    };

    return {
      loadImage: loadImage
    };
  };

  return AssetManager;
});
