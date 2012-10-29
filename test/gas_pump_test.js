describe("inventory", function() {

  require(['sprites/GasPump'], function (GasPump) {

    keyboard = require('Keyboard');

    beforeEach(function () {
      $('.back').click();
      $('#resume').click();

      clearSprites();

      var x = Game.map.originOffsetX + 450;
      var y = Game.map.originOffsetY + 300;

      pump = new GasPump();
      pump.pos.x = x;
      pump.pos.y = y;
      Game.addSprite(pump);

      keyboard.keyStatus.right = true;
    });

    afterEach(function () {
      keyboard.keyStatus.right = false;
      keyboard.keyStatus.left = true;
      waits(300);
      runs(function () {
        keyboard.keyStatus.left = false;
      });
    });

    it("shows an Empty tooltip when empty", function () {
      pump.broken = false;
      pump.currentFuel = 0;
      Game.dude.pos.x = pump.pos.x - 15;

      waits(100);
      runs(function () {
        var tip = $('.tip');
        expect(tip).toBeVisible();
        expect(tip).toHaveText("Empty");
      });
    });

    it("shows a Broken tooltip when broken", function () {
      pump.broken = true;
      Game.dude.pos.x = pump.pos.x - 15;

      waits(100);
      runs(function () {
        var tip = $('.tip');
        expect(tip).toBeVisible();
        expect(tip).toHaveText("Broken");
      });
    });

    it("shows a Has Gas tooltip when has gas", function () {
      pump.broken = false;
      pump.currentFuel = 1;
      Game.dude.pos.x = pump.pos.x - 15;

      waits(100);
      runs(function () {
        var tip = $('.tip');
        expect(tip).toBeVisible();
        expect(tip).toHaveText("Has Gas");
      });
    });

    it("removes the tip after walking away", function () {
      Game.dude.pos.x = pump.pos.x - 15;

      waits(100);
      runs(function () {
        var tip = $('.tip');
        expect(tip).toBeVisible();

        // move away
        keyboard.keyStatus.left = true;

        waits(300);
        runs(function () {
          expect(tip).not.toBeVisible();
        });
      });
    });

  });

});
