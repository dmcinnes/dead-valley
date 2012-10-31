// AssetManager

define(['Progress', 'Console'], function (Progress, Console) {
  var cb = (window.DV && window.DV.version);

  var AssetManager = function (base) {
    var images = {};

    var imageUrl = function (name) {
      return base + name + '.png?cb=' + cb;
    };

    var loadImage = function (name, callback) {
      if (images[name]) {
        if (callback) {
          callback(images[name]);
        }
      } else {
        Progress.onStart(function () {
          var image = new Image();
          image.onload = function () {
            images[name] = image;
            if (callback) {
              callback(image);
            }
            Progress.increment();
          };
          image.onerror = function () {
            Console.error("failed to load image " + name);
            Progress.increment();
          };
          image.src = imageUrl(name);
        });
      }
    };

    return {
      loadImage: loadImage,
      imageUrl:  imageUrl
    };
  };

  return AssetManager;
});
