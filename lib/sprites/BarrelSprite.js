// the ubiquitous barrel

define(["Sprite"],
       function (Sprite) {

  var BarrelSprite = function (model) {
    this.init(model);

    this.rolling = false;
  };
  BarrelSprite.prototype = new Sprite();

  BarrelSprite.prototype.draw = function (delta) {
    var model = this.model;
    if (model.isRolling) {
      if (!this.rolling) {
        this.rolling = true;
        this.imageOffset.x = 76;
        this.tileOffset    = 22;
        this.node.css('width', model.tileWidth);
      }
      this.drawTile(Math.floor(model.barrelState), 0);
    } else {
      this.drawTile(0, 0);
    }
  };

  return BarrelSprite;
});
