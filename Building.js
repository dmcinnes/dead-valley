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

    this.inventory = new Inventory({width:12, height:8, name:this.name});

    this.calculateNormals();
  };

  // don't save when the level is saved like a sprite
  // -- we're going to save this our own way
  Building.prototype.shouldSave     = false;
  Building.prototype.name           = 'Building';
  Building.prototype.visible        = true;
  Building.prototype.isBuilding     = true;
  Building.prototype.mass           = Number.MAX_VALUE;
  Building.prototype.inertia        = Number.MAX_VALUE;

  Building.prototype.calculateNormals = function () {
    var p1, p2, n, i;

    this.currentNormals = [];

    for (i = 1; i < this.points.length; i++) {
      p1 = this.points[i-1];
      p2 = this.points[i];

      n = p2.subtract(p1).normal();

      this.currentNormals.push(n);
    }

    p1 = this.points[this.points.length-1];
    p2 = this.points[0];

    n = p2.subtract(p1).normal();
    this.currentNormals.push(n);
  };

  Building.prototype.transformedPoints = function () {
    return this.points;
  };

  Building.prototype.collision = function () {
  };

  Building.prototype.bulletHit = function (hit, damage) {
    bulletHit.fireSparks(hit);
  };

  Building.prototype.enter = function (dude) {
    game.events.fireEvent('enter building', this);
  };

  Building.prototype.leave = function (dude) {
    game.events.fireEvent('leave building', this);
  };

  collidable(Building);

  // redefine collidable's pointVel
  Building.prototype.pointVel = function () {
    return new Vector(0, 0);
  };

  return Building;
});
