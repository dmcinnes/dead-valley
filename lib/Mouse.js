define(['Game'], function (Game) {

  var determineMouseEventCollisions = function (event) {
    var coords = Game.map.worldCoordinatesFromWindow(event.pageX, event.pageY);
    var node   = Game.map.getNodeByWorldCoords(coords.x, coords.y);

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
        if (ref.checkPointCollision(coords)) {
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

  $('#canvas-mask').on('mousedown mouseup click', function (event) {
    var id = $(event.target).data('sprite-id');
    if (id) {
      var sprite = Game.getSpriteByID(id);
      Game.events.fireEvent(event.type, event, sprite);
    } else {
      Game.events.fireEvent(event.type, event);
    }
  });

});
