define(['Sprite', 'Collidable'], function (Sprite, Collidable) {

  var StopSign = function (type) {
    this.init(type || 'StopSign');
    this.mass    = Number.MAX_VALUE;
    this.inertia = Number.MAX_VALUE;
  };
  StopSign.prototype = new Sprite();
  StopSign.prototype.stationary = true;
  StopSign.prototype.description = 'Stop Sign';

  StopSign.prototype.spawned = function () {
    this.oldRot = this.pos.rot;
    this.pos.rot = 0;

    var r = this.oldRot / 90;
    if (r < 1) {
      this.tile = 0;
    } else if (r < 2) {
      this.tile = 2;
    } else if (r < 3) {
      this.tile = 1;
    } else {
      this.tile = 2;
      this.direction = true; // flip it
    }
  };

  StopSign.prototype.draw = function () {
    this.drawTile(this.tile, 0);
  };

  StopSign.prototype.saveMetadata = function () {
    var metadata = Sprite.prototype.saveMetadata.call(this);
    metadata.pos = this.pos.clone();
    metadata.pos.rot = this.oldRot;
    metadata.pos.retain();
    return metadata;
  };

  Collidable(StopSign);

  return StopSign;
});
