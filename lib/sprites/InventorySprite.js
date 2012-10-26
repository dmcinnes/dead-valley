define(["Game", "Sprite", "Vector", "Collidable"],
       function (Game, Sprite, Vector, Collidable) {

  var INVENTORY_CELL_WIDTH = 44;
  var FINAL_SCALE          = 0.3;
  var HORIZONTAL_OFFSET    = 20;

  var InventorySprite = function (inventoryItem, dropPos) {

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

    this.item = inventoryItem;

    this.setPosition(dropPos);

    this.node.addClass('inventory-sprite');
  };
  InventorySprite.prototype = new Sprite();

  InventorySprite.prototype.touchOnly         = true;
  InventorySprite.prototype.stationary        = true;
  InventorySprite.prototype.isInventorySprite = true;

  // for now
  InventorySprite.prototype.shouldSave = false;


  InventorySprite.prototype.checkPosition = function (dropPos) {
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

    newPos.rot = 0;
    newPos.retain();
    this.pos = newPos;
  };

  InventorySprite.prototype.preMove = function (delta) {
    if (this.scale > FINAL_SCALE) {
      this.scale -= delta * 4;
    } else {
      this.scale = FINAL_SCALE;
    }
  };

  InventorySprite.prototype.draw = function () {
  };

  Collidable(InventorySprite);

  return InventorySprite;
});
