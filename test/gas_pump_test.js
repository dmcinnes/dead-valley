require(['sprites/GasPump', 'sprites/Honda', 'inventory/GasCan'], function (GasPump, Honda, GasCan) {

  describe("gas pump", function() {

    var keyboard = require('Keyboard');

    var $container = $('#container');

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

      Game.dude.pos.x = pump.pos.x - 15;

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

    describe("tooltip", function () {
      it("shows an Empty tooltip when empty", function () {
        pump.broken = false;
        pump.currentFuel = 0;

        waits(150);
        runs(function () {
          var tip = $('.tip:not(#skip-hints)');
          expect(tip).toBeVisible();
          expect(tip).toHaveText("Empty");
        });
      });

      it("shows a Broken tooltip when broken", function () {
        pump.broken = true;

        waits(150);
        runs(function () {
          var tip = $('.tip:not(#skip-hints)');
          expect(tip).toBeVisible();
          expect(tip).toHaveText("Broken");
        });
      });

      it("shows a Has Gas tooltip when has gas", function () {
        pump.broken = false;
        pump.currentFuel = 1;

        waits(150);
        runs(function () {
          var tip = $('.tip:not(#skip-hints)');
          expect(tip).toBeVisible();
          expect(tip).toHaveText("Has Gas");
        });
      });

      it("removes the tip after walking away", function () {
        waits(150);
        runs(function () {
          var tip = $('.tip:not(#skip-hints)');
          expect(tip).toBeVisible();

          // move away
          keyboard.keyStatus.left = true;

          waits(500);
          runs(function () {
            expect(tip).not.toBeVisible();
          });
        });
      });
    });

    describe("cursor", function () {
      it("changes the cursor class to a pump nozzle if the pump has gas and is not broken", function () {
        pump.broken = false;
        pump.currentFuel = 1;

        waits(100);
        runs(function () {
          expect($container).toHaveClass('pump');
        });
      });

      it("leaves the cursor alone if the pump is broken", function () {
        pump.broken = true;
        pump.currentFuel = 1;

        waits(100);
        runs(function () {
          expect($container).not.toHaveClass('pump');
        });
      });

      it("leaves the cursor alone if the pump doesn't have gas", function () {
        pump.broken = false;
        pump.currentFuel = 0;

        waits(100);
        runs(function () {
          expect($container).not.toHaveClass('pump');
        });
      });

      it("removes the cursor class after walking away", function () {
        pump.broken = false;
        pump.currentFuel = 1;

        waits(100);
        runs(function () {
          expect($container).toHaveClass('pump');

          // move away
          keyboard.keyStatus.left = true;

          waits(300);
          runs(function () {
            expect($container).not.toHaveClass('pump');
          });
        });
      });
    });

    describe("glow car", function () {
      it("lights up a car when hovering pump cursor if it's close enough", function () {
        pump.broken = false;
        pump.currentFuel = 1;

        waits(100);
        runs(function () {
          var car = new Honda();
          car.pos.x = Game.dude.pos.x - 30;
          car.pos.y = Game.dude.pos.y;
          Game.addSprite(car);

          car.node.trigger('mouseover');

          expect(car.node).toHaveClass('glow');
        });
      });

      it("does not light up the car for broken pumps", function () {
        pump.broken = true;
        pump.currentFuel = 1;

        waits(100);
        runs(function () {
          var car = new Honda();
          car.pos.x = Game.dude.pos.x - 30;
          car.pos.y = Game.dude.pos.y;
          Game.addSprite(car);

          car.node.trigger('mouseover');

          expect(car.node).not.toHaveClass('glow');
        });
      });

      it("does not light up the car for empty pumps", function () {
        pump.broken = false;
        pump.currentFuel = 0;

        waits(100);
        runs(function () {
          var car = new Honda();
          car.pos.x = Game.dude.pos.x - 30;
          car.pos.y = Game.dude.pos.y;
          Game.addSprite(car);

          car.node.trigger('mouseover');

          expect(car.node).not.toHaveClass('glow');
        });
      });

      it("does not light up the car if it's too far away", function () {
        pump.broken = false;
        pump.currentFuel = 1;

        waits(100);
        runs(function () {
          var car = new Honda();
          car.pos.x = Game.dude.pos.x - 50;
          car.pos.y = Game.dude.pos.y;
          Game.addSprite(car);

          car.node.trigger('mouseover');

          expect(car.node).not.toHaveClass('glow');
        });
      });
    });

    describe("fill er up", function () {
      beforeEach(function () {
        pump.broken = false;
        pump.currentFuel = 1;

        waits(100);
      });

      it("starts fueling the car when the mouse button is pressed", function () {
        runs(function () {
          var car = new Honda();
          car.pos.x = Game.dude.pos.x - 30;
          car.pos.y = Game.dude.pos.y;
          car.currentFuel = 0;
          Game.addSprite(car);

          car.node.trigger('mousedown');

          waits(100);

          runs(function () {
            expect(pump.fueling).not.toBeNull();
            expect(car.currentFuel).toBeGreaterThan(0);
            expect(pump.currentFuel).toBeLessThan(1);
          });
        });
      });

      it("stops fueling the car when the mouse button is released", function () {
        runs(function () {
          var car = new Honda();
          car.pos.x = Game.dude.pos.x - 30;
          car.pos.y = Game.dude.pos.y;
          car.currentFuel = 0;
          Game.addSprite(car);

          car.node.trigger('mousedown');

          waits(100);

          runs(function () {
            var carFuel = car.currentFuel;
            var pumpFuel = pump.currentFuel;

            expect(pump.fueling).not.toBeNull();

            car.node.trigger('mouseup');

            nextFrame(function () {
              expect(pump.fueling).toBeNull();
              expect(car.currentFuel).toEqual(carFuel);
              expect(pump.currentFuel).toEqual(pumpFuel);
            });
          });
        });
      });

      it("stops fueling the car when the pump runs out of gas", function () {
        pump.currentFuel = 0.1;

        runs(function () {
          var car = new Honda();
          car.pos.x = Game.dude.pos.x - 30;
          car.pos.y = Game.dude.pos.y;
          car.currentFuel = 0;
          Game.addSprite(car);

          car.node.trigger('mousedown');

          waits(300);

          runs(function () {
            expect(pump.fueling).toBeNull();
            expect(car.currentFuel).toBeCloseTo(0.1);
            expect(pump.currentFuel).toEqual(0);
          });
        });
      });

      it("shows an Empty tooltip when the pump runs out of gas", function () {
        pump.currentFuel = 0.1;

        runs(function () {
          var car = new Honda();
          car.pos.x = Game.dude.pos.x - 30;
          car.pos.y = Game.dude.pos.y;
          car.currentFuel = 0;
          Game.addSprite(car);

          var tip = $('.tip:not(#skip-hints)');
          expect(tip).toBeVisible();
          expect(tip).toHaveText("Has Gas");

          car.node.trigger('mousedown');

          waits(300);

          runs(function () {
            expect(tip).toBeVisible();
            expect(tip).toHaveText("Empty");
          });
        });
      });
    });

    describe("filling a gas can", function () {
      beforeEach(function () {
        pressKey('i');

        pump.broken = false;
        pump.currentFuel = 1;

        Game.dude.inventory.clear();

        gasCan = createItem('GasCan');
        Game.dude.inventory.stuffItemIn(gasCan);

        canNode = gasCan.displayNode().find('img');

        waits(100);
      });

      it("starts fueling the gas can when the mouse button is pressed", function () {
        runs(function () {
          canNode.trigger('mousedown');

          waits(100);

          runs(function () {
            expect(pump.fueling).not.toBeNull();
            expect(gasCan.currentFuel).toBeGreaterThan(0);
            expect(pump.currentFuel).toBeLessThan(1);
          });
        });
      });

      it("stops fueling the gas can when the mouse button is released", function () {
        runs(function () {
          canNode.trigger('mousedown');

          waits(100);

          runs(function () {
            canFuel  = gasCan.currentFuel;
            pumpFuel = pump.currentFuel;

            expect(pump.fueling).not.toBeNull();

            canNode.trigger('mouseup');

            nextFrame(function () {
              expect(pump.fueling).toBeNull();
              expect(gasCan.currentFuel).toEqual(canFuel);
              expect(pump.currentFuel).toEqual(pumpFuel);
            });
          });
        });
      });

      it("stops fueling the gas can when the pump runs out of gas", function () {
        pump.currentFuel = 0.1;

        runs(function () {
          canNode.trigger('mousedown');

          waits(300);

          runs(function () {
            expect(pump.fueling).toBeNull();
            expect(gasCan.currentFuel).toEqual(0.1);
            expect(pump.currentFuel).toEqual(0);
          });
        });
      });

      it("update the tooltip to 'Empty' when it runs out of gas", function () {
        pump.currentFuel = 0.1;

        runs(function () {
          var tip = $('.tip:not(#skip-hints)');
          expect(tip).toBeVisible();
          expect(tip).toHaveText("Has Gas");

          canNode.trigger('mousedown');

          waits(300);

          runs(function () {
            expect(tip).toBeVisible();
            expect(tip).toHaveText("Empty");
          });
        });
      });
    });

  });

});
