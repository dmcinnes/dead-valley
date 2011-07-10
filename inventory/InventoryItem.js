// InventoryItem

define(function () {

  // check if this thing accepts the other thing
  var acceptsDrop = function (other) {
    return _.any(this.acceptables, function (type) {
      return other instanceof type;
    });
  };

  var viable = function () {
    return true;
  };

  var InventoryItem = function (object, config) {
    object.prototype.width       = config.width;
    object.prototype.height      = config.height;
    object.prototype.image       = 'assets/inventory/' + config.image + '.png';
    object.prototype.acceptables = config.accepts || [];

    if (!object.prototype.displayNode) {
      var display = $("<img/>").attr('src', object.prototype.image);
      object.prototype.displayNode = function () {
        return display;
      };
    }

    object.prototype.acceptsDrop = acceptsDrop;
    
    // only override viable if it's not defined
    if (!object.prototype.viable) {
      object.prototype.viable = viable;
    }

    var oldSave = object.prototype.saveMetadata || function () { return {}; };
    object.prototype.saveMetadata = function () {
      return $.extend({ clazz: config.clazz,
                        x:     this.x,
                        y:     this.y },
                      oldSave.call(this),
                      config.saveMetadata || {});
    };

    object.x = null;
    object.y = null;
  };

  return InventoryItem;
});
