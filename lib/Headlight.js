// Headlight

define(['Light'], function (Light) {
  var length =    450; // 150 ft
  var halfWidth =  50;
  
  var renderLight = Light({
    length:    length, // 150 ft
    halfWidth: halfWidth,
    lampHW:    3
  });

  var render = function (sprite, offset) {
    renderLight(sprite.pos, sprite.pos.rot * Math.PI / 180, null, offset);
  };

  return {
    render: render,
    length: length + halfWidth
  };
});
