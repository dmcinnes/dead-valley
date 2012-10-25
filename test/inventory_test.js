describe("inventory", function() {

  // because we fake double clicks
  function doubleClickThen(node, callback) {
    node.click();
    node.click();

    waits(300);

    runs(callback);
  }

  beforeEach(function () {
    $('.back').click();
    $('#resume').click();
    $dudeInventory = $('#dude-inventory');
    $dudeInventory.css('visibility', 'visible');

    Game.dude.inventory.clear();
    Game.dude.hands.clear();
  });

  it("opens and closes when i is pressed", function () {
    $dudeInventory.css('visibility', 'hidden');
    pressKey('i');

    nextFrame(function () {
      expect($dudeInventory.css('visibility')).toEqual('visible');

      pressKey('i');

      nextFrame(function () {
        expect($dudeInventory.css('visibility')).toEqual('hidden');
      });
    });
  });

  it("moves an item to an open hand when double-clicked", function () {
    Cheat.give('Beans');
    var beanz = $('.inventory-item:first');
    expect(beanz.parents('table.inventory')).not.toHaveId('dude-hands');

    doubleClickThen(beanz, function () {
      expect(beanz.parents('table.inventory')).toHaveId('dude-hands');
    });
  });

  it("moves an item back to the inventory when double clicks in the hands", function () {
    Cheat.give('Beans');
    var beanz = $('.inventory-item:first');

    doubleClickThen(beanz, function () {
      expect(beanz.parents('table.inventory')).toHaveId('dude-hands');

      doubleClickThen(beanz, function () {
        expect(beanz.parents('table.inventory')).not.toHaveId('dude-hands');
      });
    });
  });

});
