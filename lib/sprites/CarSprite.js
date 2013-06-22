// CarSprite

define(["Game",
        "car-list",
        "sprite-info",
        "Sprite",
        "Headlight",
        "Taillight",
        "Fuel"],

        function (Game,
                  carList,
                  spriteInfo,
                  Sprite,
                  Headlight,
                  Taillight,
                  Fuel) {

  var CarSprite = function () {
  };
  CarSprite.prototype = new Sprite();

  CarSprite.prototype.init = function (model) {
    Sprite.prototype.init.call(this, model);
    this.node.addClass('car');
  };

  CarSprite.prototype.draw = function () {
    var car = this.model;

    if (!car.visible || !car.imageData) {
      return;
    }

    // dead!
    if (car.health <= 0) {
      this.drawTile(2);
      return;
    }

    if (car.health > 25) {
      this.drawTile(0);
    } else {
      this.drawTile(1);
    }

    if (car.driver) {
      if (car.braking) {
        // break lights
        if (car.taillights.left) {
          this.drawTile(5);
        }
        if (car.taillights.right) {
          this.drawTile(6);
        }
      }
    }

    // headlights
    if (car.headlightsOn) {
      if (car.headlights.left) {
        this.drawTile(3);
        Headlight.render(car, car.headlightsPos.left);
      }
      if (car.headlights.right) {
        this.drawTile(4);
        Headlight.render(car, car.headlightsPos.right);
      }
      if (car.taillights.left) {
        Taillight.render(car, 5, car.braking);
      }
      if (car.taillights.right) {
        Taillight.render(car, 6, car.braking);
      }
    }

    // flip the glow class if the bit is set either way
    if (this.model.glowing !== undefined) {
      if (this.model.glowing) {
        this.node.addClass('glow');
      } else {
        this.node.removeClass('glow');
      }
      this.model.glowing = undefined;
    }
  };

  CarSprite.prototype.isInRenderRange = function () {
    var car = this.model;

    var x = car.pos.x - Game.map.originOffsetX;
    var y = car.pos.y - Game.map.originOffsetY;

    return !(x + car.tileWidth  + Headlight.length < 0 ||
             y + car.tileHeight + Headlight.length < 0 ||
             x - car.tileWidth  - Headlight.length > Game.GameWidth ||
             y - car.tileHeight - Headlight.length > Game.GameHeight);
  };

  // preload car images
  _.each(carList, function (car) {
    _.each(car.colors, function (color) {
      var img = spriteInfo[car.name].img + '-' + color;
      Game.assetManager.loadImage(img);
    });
  });

  $('#sprites').on('mouseover', '.car', function () {
    var $car = $(this);
    var id = $car.data('sprite-id');
    var sprite = Game.getSpriteByID(id);
    if (sprite &&
        Fuel.activePump &&
        Fuel.activePump.isCarSpriteCloseEnough(sprite)) {
      sprite.glow();
    }
  }).on('mouseout', '.car', function () {
    var $car = $(this);
    if ($car.hasClass('glow')) {
      var id = $car.data('sprite-id');
      var sprite = Game.getSpriteByID(id);
      sprite.stopGlowing();
    }
  });

  Game.events.subscribe('fuel source inactive', function () {
    var $car = $('#sprites .car.glow');
    if ($car.length) {
      var id = $car.data('sprite-id');
      var sprite = Game.getSpriteByID(id);
      sprite.stopGlowing();
    }
  });

  // Define Sprite classes for every car in the car list
  _.each(carList, function (car, key) {
    define('sprites/' + car.name + 'Sprite', ['sprites/CarSprite'], function (CarSprite) {
      var SpriteClazz = function (car) {
        this.init(car);
      };
      SpriteClazz.prototype = new CarSprite();
      return SpriteClazz;
    });
  });

  return CarSprite;
});
