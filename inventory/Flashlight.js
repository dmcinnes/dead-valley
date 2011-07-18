// Pistol

define(['inventory/InventoryItem', 'game'], function (InventoryItem, game) {

  var context = game.skyContext;
  
  var maxLength = 120;
  var halfWidth = 30;
  var lampHW    = 3;
  var offset    = -10;

  var Flashlight = function () {
  };

  Flashlight.prototype.render = function (dude) {
    context.save();
    context.shadowBlur = 15.0;
    context.globalCompositeOperation = 'destination-out';
    dude.configureTransform(context);
    if (dude.aimDirection) {
      var vector = dude.aimPoint.subtract(dude.pos);
      var length = Math.min(vector.magnitude(), maxLength);
      context.rotate(dude.aimDirection + Math.PI/2);
      context.translate(0, offset);
      context.beginPath();
      context.moveTo(-lampHW, 0);
      context.lineTo(-halfWidth, -length);
      context.arc(0, -length, halfWidth, 0, Math.PI*2);
      context.lineTo(lampHW, 0);
      context.arc(0, 0, lampHW, 0, Math.PI);
    } else {
      context.beginPath();
      context.arc(-2, 0, halfWidth/4, 0, Math.PI*2);
    }
    context.fill();
    context.restore();
  };

  InventoryItem(Flashlight, {
    width:  1, 
    height: 3, 
    image:  'flashlight',
    clazz:  'Flashlight'
  });

  Flashlight.prototype.aimable = true;

  return Flashlight;
});
