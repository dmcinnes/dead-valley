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

  $('#click-overlay').mousedown(function (event) {
    Game.events.fireEvent('mousedown', event, determineMouseEventCollisions(event));
  }).mouseup(function (event) {
    Game.events.fireEvent('mouseup', event, determineMouseEventCollisions(event));
  }).click(function (event) {
    Game.events.fireEvent('click', event, determineMouseEventCollisions(event));
  });

});
