require(['sprites/Honda', 'inventory/GasCan'], function (Honda, GasCan) {

  describe("gas can", function () {

    beforeEach(function () {
      $('.back').click();
      $('#resume').click();

      pressKey('i');

      gasCan = createItem('GasCan');
      Game.dude.inventory.stuffItemIn(gasCan);
      canNode = gasCan.displayNode().find('img');

      clearSprites();

      var x = Game.map.originOffsetX + 450;
      var y = Game.map.originOffsetY + 300;

      car = new Honda();
      car.pos.x = x;
      car.pos.y = y;
      Game.addSprite(car);

      Game.dude.pos.x = pump.pos.x - 15;
    });

    describe("cursor when activated", function () {
      it("changes the cursor class to gascan if the can has gas", function () {
        gasCan.currentFuel = 1;

        canNode.rightClick();
      });

      it("doesn't change the cursor class to gascan if the can has gas", function () {
      });
    });

    describe("fuel display", function () {
    });

    describe("fill car", function () {
    });

  });

});
