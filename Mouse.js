define(['game'], function (game) {

  var checkSpritePointCollision = function (sprite, point) {
    var minDepth = Number.MAX_VALUE;
    var normals = sprite.currentNormals;

    for (var i = 0; i < normals.length; i++) {
      var normal = normals[i];
      var spriteProj = sprite.lineProjection(normal);
      var pointProj  = normal.dotProduct(point);

      if (pointProj < spriteProj[0] || pointProj > spriteProj[1]) {
        return false; // no collision!
      }
    }

    return true;
  };

  var determineMouseEventCollisions = function (event) {
    var coords = game.map.worldCoordinatesFromWindow(event.pageX, event.pageY);
    var node   = game.map.getNodeByWorldCoords(coords.x, coords.y);

    var nodes = [node,
                 node.north,
                 node.south,
                 node.east,
                 node.west,
                 node.north.east,
                 node.north.west,
                 node.south.east,
                 node.south.west];

    var canidates = [];
    var nodeCount = nodes.length;
    var clicked   = null;

    for (var i = 0; i < nodeCount; i++) {
      var ref = nodes[i].nextSprite;
      while (ref) {
        if (checkSpritePointCollision(ref, coords)) {
          // only take the highest z valued sprite
          if (!clicked || clicked.z < ref.z) {
            clicked = ref;
          }
        }
        ref = ref.nextSprite;
      }
    }

    return clicked;
  };

  $('#click-overlay').mousedown(function (event) {
    game.events.fireEvent('mousedown', event, determineMouseEventCollisions(event));
  }).mouseup(function (event) {
    game.events.fireEvent('mouseup', event, determineMouseEventCollisions(event));
  }).click(function (event) {
    game.events.fireEvent('click', event, determineMouseEventCollisions(event));
  });

});
