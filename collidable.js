// collidable
//
// A mixin for collision handling

define(["vector"], function (Vector) {

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
          if (ref.collidable) this.checkCollision(ref);
          ref = ref.nextSprite;
        } while (ref)
      }
    };

    // TODO figure out collidable sprite pairs first
    // and eliminate duplicates before running
    // checkCollision
    thing.prototype.checkCollision = function (other) {
      var normals, minDepth, nl, we, they, left, right, depth,
          minDepth, minPoint, normalIndex;

      if (!other.visible ||
           this == other ||
          !this.collidesWith[other.name]) return;

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

      this.collision(other, point, normal);
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

  return collidable;
});

