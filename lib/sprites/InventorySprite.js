define(["Sprite", "Vector"],
       function (Sprite, Vector) {

  var INVENTORY_CELL_WIDTH = 44;

  var InventorySprite = function (inventoryItem, pos) {
    this.item = inventoryItem;

    this.pos     = pos;
    this.pos.rot = 0;
    // this.pos.rot = Math.random() * 360;
    this.pos.retain();

    this.associatedDomNodes = [];

    this.z = 20;

    this.scale = 0.3;

    this.opacity = 1;

    var displayNode = inventoryItem.displayNode();
    this.tileWidth  = inventoryItem.width * INVENTORY_CELL_WIDTH;
    this.tileHeight = inventoryItem.height * INVENTORY_CELL_WIDTH;
    this.center = Vector.create(this.tileWidth/2, this.tileHeight/2, true);

    this.image = inventoryItem.spriteImage;

    this.node = this.createNode(1);

    this.node.addClass('inventory-sprite');
  };
  InventorySprite.prototype = new Sprite();
  InventorySprite.prototype.stationary = true;
  InventorySprite.prototype.fx         = true;

  InventorySprite.prototype.draw = function () {
  };

  return InventorySprite;
});
