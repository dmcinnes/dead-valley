require(['sprites/Honda', 'inventory/GasCan'], function (Honda, GasCan) {

  describe("gas can", function () {

    var $container = $('#container');

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

      Game.dude.pos.x = car.pos.x - 15;
    });

    afterEach(function () {
      // disable active gascan
      $('#canvas-mask').mouseup();
      Game.dude.inventory.clear();
    });

    describe("cursor when activated", function () {
      it("changes the cursor class to gascan if the can has gas", function () {
        gasCan.currentFuel = 1;

        canNode.rightClick();

        waits(5);

        runs(function () {
          expect($container).toHaveClass('gascan');
        });
      });

      it("doesn't change the cursor class to gascan if the can doesn't have gas", function () {
        gasCan.currentFuel = 0;

        canNode.rightClick();

        waits(5);

        runs(function () {
          expect($container).not.toHaveClass('gascan');
        });
      });

      it("clears the cursor after the mouse has been clicked and released", function () {
        gasCan.currentFuel = 1;

        canNode.rightClick();

        waits(5);

        runs(function () {
          expect($container).toHaveClass('gascan');

          $('#canvas-mask').mouseup();

          expect($container).not.toHaveClass('gascan');
        });
      });
    });

    describe("fuel display", function () {
    });

    describe("fill car", function () {
    });

  });

});
