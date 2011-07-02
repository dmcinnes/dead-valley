define(['game', 'hud/InventoryDisplay', 'hud/LifeMeter', 'hud/Pause', 'hud/Framerate', 'DudeHands'],
       function (game, InventoryDisplay, LifeMeter, Pause, Framerate, DudeHands) {

  var dudeInventory, dudeHands;
  var $dudeInventoryDiv = $('#dude-inventory');

  game.events.subscribe('toggle inventory', function () {
    dudeInventory.toggle();
    dudeHands.toggle();
  });

  game.events.subscribe('hide inventory', function () {
    dudeInventory.hide();
    dudeHands.hide();
  });

  game.events.subscribe('new dude', function (dude) {
    $dudeInventoryDiv.empty();
    dudeInventory = new InventoryDisplay(game.dude.inventory, $dudeInventoryDiv);
    dudeHands = new InventoryDisplay(DudeHands, $dudeInventoryDiv, { id:'dude-hands' });
  });

  // framerate HUD
  game.addSprite(Framerate);
});
