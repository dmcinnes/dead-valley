define(["game", "collidable", "vector", "fx/BulletHit", "Inventory"],
       function (game, collidable, Vector, BulletHit, Inventory) {

  var bulletHit = new BulletHit();

  var Building = function (points) {
    this.points = points;

    // find center point
    this.pos = _.reduce(points, function (memo, point) {
      return memo.translate(point);
    }, new Vector(0, 0));

    this.pos.scale(1/points.length);
    this.pos.rot = 0;

    this.vel = new Vector(0, 0);
    this.vel.rot = 0;

    this.inventory = new Inventory(12, 8);
  };

  // don't save when the level is saved -- we're going to save this our own way
  Building.prototype.shouldSave     = false;
  Building.prototype.name           = 'Building';
  Building.prototype.visible        = true;
  Building.prototype.isBuilding     = true;
  Building.prototype.mass           = Number.MAX_VALUE;
  Building.prototype.inertia        = Number.MAX_VALUE;
  Building.prototype.currentNormals = [
    new Vector(1, 0),
    new Vector(0, 1)
  ];

  Building.prototype.transformedPoints = function () {
    return this.points;
  };

  Building.prototype.collision = function () {
  };

  Building.prototype.bulletHit = function (hit, damage) {
    bulletHit.fireSparks(hit);
  };

  Building.prototype.enter = function (dude) {
  };

  Building.prototype.leave = function (dude) {
  };

  collidable(Building);

  // redefine collidable's pointVel
  Building.prototype.pointVel = function () {
    return new Vector(0, 0);
  };

  return Building;
});
