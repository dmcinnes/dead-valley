define(["Game", "Sprite", "Vector", "Collidable"],
       function (Game, Sprite, Vector, Collidable) {

  var INVENTORY_CELL_WIDTH = 44;
  var FINAL_SCALE_DEFAULT  = 0.3;
  var HORIZONTAL_OFFSET    = 20;

  var InventorySprite = function (inventoryItem, dropPos) {
    // sprite marshal sets one arg
    if (arguments.length > 1) {
      this.configure(inventoryItem);
      this.setPosition(dropPos);
    } else {
      // so SpriteMarshal won't fail in recursive set
      // because the pos object doesn't exist
      this.pos = Vector.create(0, 0, true);
    }
  };
  InventorySprite.prototype = new Sprite();

  InventorySprite.prototype.touchOnly         = true;
  InventorySprite.prototype.stationary        = true;
  InventorySprite.prototype.isInventorySprite = true;

  // set up
  InventorySprite.prototype.configure = function (inventoryItem) {
    var width  = inventoryItem.width  * INVENTORY_CELL_WIDTH;
    var height = inventoryItem.height * INVENTORY_CELL_WIDTH;

    this.init({
      name:   inventoryItem.name,
      img:    inventoryItem.spriteImage,
      width:  width,
      height: height,
      center: Vector.create(width/2, height/2, true),
      z: 99
    });

    this.scale = 1;

    this.finalScale = inventoryItem.dropScale  || FINAL_SCALE_DEFAULT;

    this.item = inventoryItem;

    this.node.addClass('inventory-sprite');
  };

  InventorySprite.prototype.setPosition = function (dropPos) {
    var occupied;
    var newPos = Game.dude.pos.clone();

    // push it to the left or right depending on
    // which side it was dropped on
    newPos.x += dropPos.x < Game.dude.pos.x ? -HORIZONTAL_OFFSET : HORIZONTAL_OFFSET;

    var test = function (sprite) {
      return sprite.visible &&
        sprite.collidable &&
        !sprite.touchOnly &&
        sprite.checkPointCollision(newPos);
    };

    for (var i = 0; i < 2; i++) {
      var node   = Game.map.getNodeByWorldCoords(newPos.x, newPos.y);
      var nearby = node.nearby();
      occupied = _.any(nearby, test);
      if (!occupied) {
        break;
      }
      // move to the other side
      newPos.x += 2 * (Game.dude.pos.x - newPos.x);
    }

    if (occupied) {
      // both sides are blocked
      // just drop it under the dude's feet
      // and he'll pick it up again
      newPos = Game.dude.pos.clone();
    }

    newPos.round();
    newPos.rot = 0;
    newPos.retain();
    this.pos = newPos;
  };

  InventorySprite.prototype.preMove = function (delta) {
    if (this.scale > this.finalScale) {
      this.scale -= delta * 4;
    } else {
      this.scale = this.finalScale;
    }
  };

  InventorySprite.prototype.draw = function () {
  };

  // set from sprite marshal
  InventorySprite.prototype.setItem = function (itemData, complete) {
    var self = this;

    // have to wait for this to load too
    complete.another();
    require(['inventory/'+itemData.clazz], function (InventoryClass) {
      var item = new InventoryClass();
      for (var val in itemData) {
        item[val] = itemData[val];
      }

      // configure calls init, but we already have a configured pos
      // yes this is a hack
      var oldPos = self.pos.clone();

      // configure the object from the item
      self.configure(item);

      self.pos.set(oldPos);
      oldPos.free();

      // we're done
      complete.done();
    });
  };

  InventorySprite.prototype.saveMetadata = function () {
    var metadata = Sprite.prototype.saveMetadata.call(this);
    metadata.clazz   = 'InventorySprite';
    metadata.setItem = this.item.saveMetadata();
    return metadata;
  };

  Collidable(InventorySprite);

  return InventorySprite;
});
