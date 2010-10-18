define(function () {
  var AssetManager = function (onComplete) {
    var loadedCount = 0;
    var assets = [];

    this.onComplete = onComplete;

    var assetLoaded = function () {
      loadedCount++;
      if (loadedCount == assets.length) {
        if (this.onComplete) this.onComplete();
      } else {
        loadNextAsset();
      }
    };

    var loadNextAsset = function () {
      assets[loadedCount]();
    };

    this.registerImage = function (src) {
      var image = new Image();
      image.onload = $.proxy(assetLoaded, null, this);

      assets.push(function () {
        image.src = src;
      });

      return image;
    };

    this.loadAssets = function () {
      loadNextAsset();
    };

    this.__defineGetter__('loadedCount', function () { return loadedCount; });
    this.__defineGetter__('totalCount', function () { return assets.length; });
  };

  return AssetManager;
});
