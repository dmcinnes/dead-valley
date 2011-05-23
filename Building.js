define(["collidable", "vector"],
       function (collidable, Vector) {

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
  };

  Building.prototype.name    = 'Building';
  Building.prototype.visible = true;
  Building.prototype.mass    = Number.MAX_VALUE;
  Building.prototype.inertia = Number.MAX_VALUE;
  Building.prototype.currentNormals = [
    new Vector(1, 0),
    new Vector(0, 1)
  ];

  Building.prototype.transformedPoints = function () {
    return this.points;
  };

  Building.prototype.collision = function () {
  };

  collidable(Building);

  // redefine collidable's pointVel
  Building.prototype.pointVel = function () {
    return new Vector(0, 0);
  };

  return Building;
});
