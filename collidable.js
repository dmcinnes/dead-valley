// collidable
//
// A mixin for collision handling

define(["vector"], function (Vector) {

  var currentCollisionList = [];

  var findCollisionCanidates = function () {
    if (!this.visible || !this.currentNode) return [];
    var cn = this.currentNode;
    var canidates = [];
    var north = cn.north;
    var south = cn.south;
    return [cn,
            north,
            south,
            cn.east,
            cn.west,
            north && north.east,
            north && north.west,
            south && south.east,
            south && south.west];
  };

  var checkCollisionsAgainst = function (canidates) {
    var len = canidates.length;
    var ref, canidate;
    for (var i = 0; i < len; i++) {
      canidate = canidates[i];
      ref = canidate && canidate.nextSprite;
      while (ref) {
	if (ref.collidable) {
	  this.checkCollision(ref);
	}
	ref = ref.nextSprite;
      }
    }
  };

  // TODO figure out collidable sprite pairs first
  // and eliminate duplicates before running
  // checkCollision
  var checkCollision = function (other) {
    var normals, minDepth, nl, we, they, left, right, depth,
        minPoint, normalIndex, self;

    if (!other.visible  ||
         this === other ||
        (this.collidesWith &&
        !this.collidesWith[other.name])) {
      return;
    }

    // check to see if the pair has already been checked for collisions
    self = this;
    if (_(currentCollisionList).detect(function (pair) {
         return ((pair[0] === other && pair[1] === self) ||
                 (pair[0] === self && pair[1] === other));
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
    var wePoint = normalIndex >= this.currentNormals.length;
    if (wePoint) {
      point = minPoint[0];
    } else {
      point = minPoint[1];
    }

    // some of these normals (like building's) are not
    // calculated every frame so we need to protect them
    var normal = normals[normalIndex].clone();
    if (minDepth > 0) { // don't want a 0,0 normal
      // scale the normal to the penetration depth
      normal.scale(minDepth);
    }

    // normal should always point toward 'this'
    if (point.subtract(this.pos).dotProduct(normal) > 0) {
      normal.scale(-1);
    }

    // TODO gotta be a better way to structure all this
    if (this.ignoreCollisionResolution || other.ignoreCollisionResolution) {
      this.touch(other, point, normal);
      other.touch(this, point, normal);
    } else {
      var vab = resolveCollision(this, other, point, normal, wePoint);
      this.collision(other, point, normal, vab);
      other.collision(this, point, normal.scale(-1), vab);
    }
  };

  var lineProjection = function (normal) {
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
  var pointVel = function (worldOffset) {
    return worldOffset.normal()
                  .scale(this.vel.rot * Math.PI / 180.0)
                  .translate(this.vel);
  };

  // resolve the collision between two rigid body sprites
  // returns false if they're moving away from one another
  // TODO: find a better way to structure all this
  var resolveCollision = function (we, they, point, vector, wePoint) {
    we.collided   = true;
    they.collided = true;

    // rectify the positions
    var wePart   = they.mass / (we.mass + they.mass);
    var theyPart = wePart - 1;
    wePart   = vector.multiply(wePart);
    theyPart = vector.multiply(theyPart);

    we.pos.translate(wePart);
    they.pos.translate(theyPart);
    
    // rectify the point
    if (wePoint) {
      point.translate(wePart);
    } else {
      point.translate(theyPart);
    }

    var n = vector.clone().normalize();

    var vab = we.pointVel(point.subtract(we.pos)).subtract(they.pointVel(point.subtract(they.pos)));

    // coefficient of restitution (how bouncy the collision is)
    // TODO make configurable by individual
    var e = 0.2;

    var ap  = point.subtract(we.pos).normal();
    var bp  = point.subtract(they.pos).normal();
    var apd = Math.pow(ap.dotProduct(n), 2);
    var bpd = Math.pow(bp.dotProduct(n), 2);

    var dot = vab.dotProduct(n);
    if (dot > 0) {
      return vab; // moving away from each other, no need to resolve
    }

    var j = -(1 + e) * dot;

    j /= n.multiply(1/we.mass + 1/they.mass).dotProduct(n) +
         apd / we.inertia + bpd / they.inertia;

    we.vel.translate(n.multiply(j  / we.mass));
    they.vel.translate(n.multiply(-j  / they.mass));

    // TODO make all rot into radians
    // this used to be 180 * but I / 5 to make the collisions less jumpy
    we.vel.rot += 34 * (ap.dotProduct(n.multiply(j)) / we.inertia) / Math.PI;
    they.vel.rot += 34 * (bp.dotProduct(n.multiply(-j)) / they.inertia) / Math.PI;

    return vab;
  };

  var checkRayCollision = function (start, end) {
    var points  = this.transformedPoints();

    var rayVector = end.subtract(start);

    // found this here:
    // http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
    var segmentCount = points.length;
    for (var i = 0; i < segmentCount; i++) {
      var j = (i + 1) % segmentCount; // wrap to 0 at end
      var segmentVector = points[j].subtract(points[i]);
      var segmentNormal = segmentVector.normal();
      // only hit facing edges
      if (segmentNormal.dotProduct(rayVector) > 0) {
        var first = points[i].subtract(start);
        var denom = rayVector.crossProduct(segmentVector);
        if (denom !== 0) {
          var t = first.crossProduct(segmentVector) / denom; // ray scale
          var u = first.crossProduct(rayVector)     / denom; // segment scale
          // all between 0 and 1
          if (t < 1 && t > 0 && u < 1 && u > 0) {
            return {
              point:     start.add(rayVector.scale(t)),
              normal:    segmentNormal.normalize(),
              direction: rayVector.normalize()
            };
          }
        }
      }
    }
    return false;
  };

  var checkPointCollision = function (point) {
    var minDepth = Number.MAX_VALUE;
    var normals = this.currentNormals;

    for (var i = 0; i < normals.length; i++) {
      var normal = normals[i];
      var spriteProj = this.lineProjection(normal);
      var pointProj  = normal.dotProduct(point);

      if (pointProj < spriteProj[0] || pointProj > spriteProj[1]) {
        return false; // no collision!
      }
    }

    return true;
  };


  // make whatever object passed to us 'collidable'
  var collidable = function (thing, collidesWith) {
    thing.prototype.collidesWith = collidesWith;
    thing.prototype.collidable   = true;

    thing.prototype.findCollisionCanidates = findCollisionCanidates;
    thing.prototype.checkCollisionsAgainst = checkCollisionsAgainst;
    thing.prototype.checkCollision         = checkCollision;
    thing.prototype.lineProjection         = lineProjection;
    thing.prototype.pointVel               = pointVel;
    thing.prototype.checkRayCollision      = checkRayCollision;
    thing.prototype.checkPointCollision    = checkPointCollision;
    
    if (!thing.prototype.touch) {
      thing.prototype.touch = function () {};
    }
  };

  collidable.clearCurrentCollisionList = function () {
    if (currentCollisionList.length > 0) {
      currentCollisionList.splice(0); // empty the array
    }
  };

  return collidable;
});
