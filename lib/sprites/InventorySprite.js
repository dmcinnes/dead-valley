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
      z: 20
    });

    this.scale = 1;

    this.item = inventoryItem;

    this.setPosition(dropPos);

    this.node.addClass('inventory-sprite');
  };
  InventorySprite.prototype = new Sprite();
  InventorySprite.prototype.fx = true;

  // for now
  InventorySprite.prototype.shouldSave = false;


  InventorySprite.prototype.setPosition = function (dropPos) {
    var newPos = Game.dude.pos.clone();

    // push it to the left or right depending on
    // which side it was dropped on
    newPos.x += dropPos.x < Game.dude.pos.x ? -HORIZONTAL_OFFSET : HORIZONTAL_OFFSET;

    var node   = Game.map.getNodeByWorldCoords(newPos.x, newPos.y);
    var nearby = node.nearby();
    var occupied = _.any(nearby, function (sprite) {
      return sprite.visible && sprite.checkPointCollision(newPos);
    });

    if (occupied) {
      // just drop it under the dude's feet
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

  return InventorySprite;
});
