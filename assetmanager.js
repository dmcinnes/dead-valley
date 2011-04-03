// AssetManager

define(["progress"], function (progress) {
  var AssetManager = function (base) {
    var loadedCount = 0;
    var assets      = [];
    var images      = {};
    var callbacks   = {};
    var onComplete  = [];

    var fireCallbacks = function (imageName) {
      if (callbacks[imageName]) {
        _(callbacks[imageName]).each(function (callback) {
          callback(images[imageName]);
        });
        callbacks[imageName] = null;
      }
    };
    
    var fireOnCompleteCallbacks = function () {
      _(onComplete).each(function (callback) {
        callback();
      });
    };

    var assetLoaded = function (imageName) {
      fireCallbacks(imageName);
      progress.increment();
      loadedCount++;
      if (loadedCount == assets.length) {
        fireOnCompleteCallbacks();
      } else {
        loadNextAsset();
      }
    };

    var loadNextAsset = function () {
      assets[loadedCount]();
    };

    this.registerImage = function (src) {
      var image = new Image();
      var name = src.split('.')[0];

      image.onload = function () {
        images[name] = image;
        assetLoaded(name);
      };

      assets.push(function () {
        image.src = base + src;
      });

      return name;
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

    this.registerImageLoadCallback = function (imageName, callback) {
      if (callbacks[imageName] === images[imageName]) {
        // image already loaded!
        fireCallbacks(imageName);
      }
      if (!callbacks[imageName]) {
        callbacks[imageName] = [];
      }
      callbacks[imageName].push(callback);
    };

    this.registerCompleteLoadCallback = function (callback) {
      if (assets.length && loadedCount == assets.length) {
        // images already loaded!
        fireOnCompleteCallbacks();
      }
      onComplete.push(callback);
    };

    this.__defineGetter__('loadedCount', function () { return loadedCount; });
    this.__defineGetter__('totalCount', function () { return assets.length; });
    this.__defineGetter__('images', function () { return images; });
  };

  return AssetManager;
});
