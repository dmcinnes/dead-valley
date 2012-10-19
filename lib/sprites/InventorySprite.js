define(["Game", "Sprite", "Vector"],
       function (Game, Sprite, Vector) {

  var INVENTORY_CELL_WIDTH = 44;
  var FINAL_SCALE          = 0.3;
  var HORIZONTAL_OFFSET    = 20;

  var InventorySprite = function (inventoryItem, pos) {
    this.item = inventoryItem;

    this.pos     = Game.dude.pos.clone();
    this.pos.rot = 0;
    // this.pos.rot = Math.random() * 360;
    this.pos.retain();

    // push it to the left or right depending on
    // which side it was dropped on
    this.pos.x += pos.x < Game.dude.pos.x ? -HORIZONTAL_OFFSET : HORIZONTAL_OFFSET;

    this.associatedDomNodes = [];

    this.z = 20;

    this.scale = 1;

    this.opacity = 1;

    var displayNode = inventoryItem.displayNode();
    this.tileWidth  = inventoryItem.width * INVENTORY_CELL_WIDTH;
    this.tileHeight = inventoryItem.height * INVENTORY_CELL_WIDTH;
    this.center = Vector.create(this.tileWidth/2, this.tileHeight/2, true);

    this.image = inventoryItem.spriteImage;

    Sprite.newID(this);
    this.node = this.createNode(1);

    this.node.addClass('inventory-sprite');
  };
  InventorySprite.prototype = new Sprite();
  InventorySprite.prototype.stationary = true;
  InventorySprite.prototype.fx         = true;

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
