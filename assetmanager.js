// AssetManager

define(["progress"], function (progress) {
  var AssetManager = function (base, onComplete) {
    var loadedCount = 0;
    var assets = [];
    var images = {};

    this.onComplete = onComplete;

    var assetLoaded = function () {
      progress.increment();
      loadedCount++;
      if (loadedCount == assets.length) {
        this.onComplete && this.onComplete();
      } else {
        loadNextAsset();
      }
    };

    var loadNextAsset = function () {
      assets[loadedCount]();
    };

    this.registerImage = function (src) {
      var image = new Image();
      image.onload = $.proxy(assetLoaded, this);

      assets.push(function () {
        image.src = base + src;
      });

      images[src.split('.')[0]] = image;

      return image;
    };

    this.loadAssets = function () {
      progress.setTotal(assets.length);
      loadNextAsset();
    };

    // TODO fix for FF
    this.copyImageAndMutateWhite = function (imageName, newImageName, r, g, b) {
      var image = images[imageName];
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      var data = imageData.data;
      var r,g,b,a;
      for (i = 0; i < data.length; i += 4) {
        if (data[i]   == 255 &&
            data[i+1] == 255 &&
            data[i+2] == 255 &&
            data[i+3] == 255) {
          data[i] = r;
          data[i+1] = g;
          data[i+2] = b;
        }
      }
      context.putImageData(imageData, 0, 0);

      images[newImageName] = canvas;

      return canvas;
    };

    this.__defineGetter__('loadedCount', function () { return loadedCount; });
    this.__defineGetter__('totalCount', function () { return assets.length; });
    this.__defineGetter__('images', function () { return images; });
  };

  return AssetManager;
});
