define(["Sprite"], function (Sprite) {

  var BuildingSprite = function (buildingModel) {
    this.model = buildingModel;
  };
  BuildingSprite.prototype = new Sprite();

  return BuildingSprite;
});
