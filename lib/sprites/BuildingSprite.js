define(["Sprite", "fx/BulletHit"], function (Sprite, BulletHit) {

  var bulletHit = new BulletHit();

  var BuildingSprite = function (buildingModel) {
    this.model = buildingModel;
  };
  BuildingSprite.prototype = new Sprite();

  BuildingSprite.prototype.bulletHit = function (hit, damage) {
    bulletHit.fireSparks(hit);
  };

  return BuildingSprite;
});
