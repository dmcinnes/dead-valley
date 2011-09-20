// InventoryItem

define(function () {

  // check if this thing accepts the other thing
  var acceptsDrop = function (other) {
    return _.any(this.acceptables, function (type) {
      return other instanceof type;
    });
  };

  // the HTML node to show in the inventory for this object
  var displayNode = function () {
    if (!this.display) {
      this.display = $("<img/>").attr('src', this.image).attr('title', this.description);
    }
    return this.display;
  };

  var viable = function () {
    return true;
  };

  var InventoryItem = function (object, config) {
    object.prototype.width       = config.width;
    object.prototype.height      = config.height;
    object.prototype.image       = 'assets/inventory/' + config.image + '.png';
    object.prototype.acceptables = config.accepts || [];
    object.prototype.description = config.description || '';
    object.prototype.movable     = true;

    // only override displayNode if it's not defined
    if (!object.prototype.displayNode) {
      object.prototype.displayNode = displayNode;
    }
    
    // only override viable if it's not defined
    if (!object.prototype.viable) {
      object.prototype.viable = viable;
    }

    object.prototype.acceptsDrop = acceptsDrop;

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
