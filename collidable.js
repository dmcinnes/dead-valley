// collidable
//
// A mixin for collision handling

define(["vector"], function (Vector) {

  var currentCollisionList = [];

  var collidable = function (thing, collidesWith) {
    thing.prototype.collidesWith = collidesWith;
    thing.prototype.collidable   = true;

    thing.prototype.findCollisionCanidates = function () {
      if (!this.visible || !this.currentNode) return [];
      var cn = this.currentNode;
      var canidates = [];
      return [cn,
              cn.north,
              cn.south,
              cn.east,
              cn.west,
              cn.north.east,
              cn.north.west,
              cn.south.east,
              cn.south.west];
    };

    thing.prototype.checkCollisionsAgainst = function (canidates) {
      var len = canidates.length;
      var ref;
      for (var i = 0; i < len; i++) {
        ref = canidates[i];
        do {
          // so we don't make nine extra function calls
          // every frame for every sprite because most
          // tiles are non-collidable
          if (ref.collidable) {
            this.checkCollision(ref);
          }
          ref = ref.nextSprite;
        } while (ref)
      }
    };

    // TODO figure out collidable sprite pairs first
    // and eliminate duplicates before running
    // checkCollision
    thing.prototype.checkCollision = function (other) {
      var normals, minDepth, nl, we, they, left, right, depth,
          minDepth, minPoint, normalIndex, self;

      if (!other.visible  ||
           this === other ||
          (this.collidesWith &&
          !this.collidesWith[other.name])) {
        return;
      }

      // check to see if the pair has already been checked for collisions
      // only have to check one way
      self = this;
      if (_(currentCollisionList).detect(function (pair) {
           return (pair[0] === other && pair[1] === self);
          })) {
        return;
      }
      // put the pair in the list for further checks
      currentCollisionList.push([this, other]);

      normals = this.currentNormals.concat(other.currentNormals);

      minDepth = Number.MAX_VALUE;

      nl = normals.length;
      for (i = 0; i < nl; i++) {
        we   = this.lineProjection(normals[i]);
        they = other.lineProjection(normals[i]);
        if (we[1] < they[0] || we[0] > they[1]) {
          return; // no collision!
        } else {
          left = Math.abs(we[1] - they[0]);
          right = Math.abs(they[1] - we[0]);
          depth = Math.min(left, right);
          if (depth < minDepth) {
            minDepth = depth;
            minPoint = (right < left) ?
                         [we[2], they[3]] :
                         [we[3], they[2]];
            normalIndex = i;
          }
        }
      }
      
      // we're edge on if the min depth is on our normal, so use "they"'s point
      var point;
      if (normalIndex < this.currentNormals.length) {
        point = minPoint[1];
      } else {
        point = minPoint[0];
      }

      var normal = normals[normalIndex].multiply(minDepth);
      // normal should always point toward 'this'
      if (point.subtract(this.pos).dotProduct(normal) > 0) {
        normal.scale(-1);
      }

      // TODO gotta be a better way to structure all this
      collidable.resolveCollision(this, other, point, normal);
      this.collision(other, point, normal);
      other.collision(this, point, normal.scale(-1));
    };

    thing.prototype.lineProjection = function (normal) {
      var min, max, points, count, dot, pmin, pmax;

      min = Number.MAX_VALUE;
      max = -Number.MAX_VALUE;
      points = this.transformedPoints();
      count = points.length;
      for (var j = 0; j < count; j++) {
        dot = normal.dotProduct(points[j]);
        min = Math.min(min, dot);
        max = Math.max(max, dot);
        if (dot === min) {
          pmin = points[j];
        } 
        if (dot === max) {
          pmax = points[j];
        }
      }
      return [min, max, pmin, pmax];
    };

    //velocity of a point on body
    thing.prototype.pointVel = function (worldOffset) {
      return new Vector(-worldOffset.y, worldOffset.x)
                    .scale(this.vel.rot * Math.PI / 180.0)
                    .translate(this.vel);
    };
  };

  collidable.clearCurrentCollisionList = function () {
    if (currentCollisionList.length > 0) {
      currentCollisionList.splice(0); // empty the array
    }
  };

  // resolve the collision between two rigid body sprites
  // TODO: find a better way to structure all this
  collidable.resolveCollision = function (we, they, point, vector) {
    we.collided   = true;
    they.collided = true;

    // rectify the positions
    var wePart   = they.mass / (we.mass + they.mass);
    var theyPart = wePart - 1;

    we.pos.translate(vector.multiply(wePart));
    they.pos.translate(vector.multiply(theyPart));

    var n = vector.normalize();

    var vab = we.pointVel(point.subtract(we.pos)).subtract(they.pointVel(point.subtract(they.pos)));

    // coefficient of restitution (how bouncy the collision is)
    // TODO make we configurable by we individual
    var e = 0.2;

    var ap  = point.subtract(we.pos).normal();
    var bp  = point.subtract(they.pos).normal();
    var apd = Math.pow(ap.dotProduct(n), 2);
    var bpd = Math.pow(bp.dotProduct(n), 2);

    var dot = vab.dotProduct(n);
    if (dot > 0) {
      return false; // moving away from each other
    }

    var j =  -(1 + e) * dot;

    j /= n.multiply(1/we.mass + 1/they.mass).dotProduct(n) +
         apd / we.inertia + bpd / they.inertia;

    we.vel.translate(n.multiply(j  / we.mass));
    they.vel.translate(n.multiply(-j  / they.mass));

    // TODO make all rot into radians
    we.vel.rot += 180 * (ap.dotProduct(n.multiply(j)) / we.inertia) / Math.PI;
    they.vel.rot += 180 * (bp.dotProduct(n.multiply(-j)) / they.inertia) / Math.PI;

    // show the point of collision
    // context.save();
    // context.translate(-game.map.originOffsetX, -game.map.originOffsetY);
    // context.fillRect(point.x-5, point.y-5, 10, 10);
    // context.restore();
  };

  return collidable;
});
