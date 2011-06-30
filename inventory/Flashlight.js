// Pistol

define(['inventory/InventoryItem', 'game'], function (InventoryItem, game) {

  var context = game.skyContext;
  
  var length    = 100;
  var halfWidth = 30;
  var lampHW    = 3;

  var Flashlight = function () {
  };

  Flashlight.prototype.render = function (dude) {
    context.save();
    context.shadowBlur = 15.0;
    dude.configureTransform(context);
    context.rotate(dude.aimDirection + Math.PI/2);
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.moveTo(-lampHW, 0);
    context.lineTo(-halfWidth, -length);
    context.arc(0, -length, halfWidth, Math.PI, Math.PI*2);
    context.lineTo(lampHW, 0);
    context.arc(0, 0, lampHW, 0, Math.PI);
    context.fill();
    context.restore();
  };

  InventoryItem(Flashlight, {
    width:  1, 
    height: 3, 
    image:  'flashlight'
  });

  Flashlight.prototype.aimable = true;

  return Flashlight;
});
