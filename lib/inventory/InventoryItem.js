// InventoryItem

define(['Game', 'Reporter'], function (Game, Reporter) {

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

  var consume = function () {
    this.inventory.removeItem(this);
    this.consumed = true;
    Reporter.itemConsumed(this);
  };

  var getInventoryItemFromEvent = function (event) {
    var target = $(event.target).parentsUntil('td').andSelf().filter('.inventory-item');
    return (target.length) ? target.data('item') : null;
  };

  $('#container').on('mouseover mouseout', '.inventory-item', function (event) {
    var item = getInventoryItemFromEvent(event);
    if (item && item[event.type]) {
      item[event.type](event);
    }
  });

  var InventoryItem = function (object, config) {
    var imageUrl = Game.assetManager.imageUrl;

    object.prototype.width       = config.width;
    object.prototype.height      = config.height;
    object.prototype.image       = imageUrl('inventory/' + config.image);
    object.prototype.acceptables = config.accepts || [];
    object.prototype.description = config.description || '';
    object.prototype.name        = config.name;
    object.prototype.clazz       = config.clazz;
    object.prototype.dropScale   = config.dropScale;
    object.prototype.movable     = true;

    var spriteImage = config.dropImage || config.image;
    // sprites construct their own image url
    object.prototype.spriteImage = 'inventory/' + spriteImage;

    // only override displayNode if it's not defined
    if (!object.prototype.displayNode) {
      object.prototype.displayNode = displayNode;
    }
    
    // only override viable if it's not defined
    if (!object.prototype.viable) {
      object.prototype.viable = viable;
    }

    object.prototype.acceptsDrop = acceptsDrop;
    object.prototype.consume     = consume;

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

    // preload image
    Game.assetManager.loadImage('inventory/' + config.image);
    if (config.dropImage) {
      Game.assetManager.loadImage('inventory/' + config.dropImage);
    }
  };

  InventoryItem.getInventoryItemFromEvent = getInventoryItemFromEvent;

  return InventoryItem;
});
