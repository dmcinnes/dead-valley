// The DUDE Sprite

define(["Game", "Sprite", "Sky"],
       function (Game, Sprite, Sky) {

  var $container = $('#container');

  var transformKey       = Modernizr.prefixed('transform');
  var transformOriginKey = Modernizr.prefixed('transformOrigin');

  // preload dude light image
  Game.assetManager.loadImage('dude-light');

  var ARM_OFFSET_X    = 5;
  var ARM_OFFSET_Y    = 8;
  var ARM_FLIP_OFFSET = 10;

  var WALKING_ANIMATION_FRAME_RATE = 0.03; // in seconds

  var DudeSprite = function (dude) {
    this.init(dude);

    this.walkingFrame        = 0;
    this.walkingFrameCounter = 0;

    this.aimingArmNode = this.createNode(1, 200);
    // set the transform origin so it rotates in the right place
    this.aimingArmNode[0].style[transformOriginKey] = ARM_OFFSET_X + 'px ' + ARM_OFFSET_Y + 'px';

    Game.assetManager.loadImage('dude-light', $.proxy(function (img) {
      this.lightImage = img;
    }, this));
  };
  DudeSprite.prototype = new Sprite();


  DudeSprite.prototype.draw = function (delta) {
    var dude = this.model;

    if (!dude.visible) return;

    if (dude.alive()) {
      if (dude.walking) {
        this.walkingFrameCounter += delta;
        if (this.walkingFrameCounter > WALKING_ANIMATION_FRAME_RATE) {
          this.walkingFrameCounter = 0.0;
          this.walkingFrame = (this.walkingFrame + 1) % 4; // four frames
        }
        this.drawTile(this.walkingFrame+1, 0);
      } else {
        this.drawTile(0, 0); // standing
      }
    } else {
      // reusing the walkingFrameCounter
      if (this.walkingFrameCounter < 0.6) {
        this.walkingFrameCounter += delta;
        this.drawTile(14, 0);
      } else {
        this.drawTile(15, 0);
      }
    }

    this.drawArms();
  };

  DudeSprite.prototype.render = function (delta) {
    var dude = this.model;
    Sprite.prototype.render.call(this, delta);

    var context = Game.skyContext;
    var map     = Game.map;

    // render night silhouette
    if (dude.takingDamage && this.imageData) {
      context.save();
      context.translate(dude.pos.x - map.originOffsetX - dude.center.x,
                        dude.pos.y - map.originOffsetY - dude.center.y);
      if (dude.direction === LEFT) {
        context.translate(20, 0);
        context.scale(-1, 1);
      }

      context.globalCompositeOperation = 'source-over';
      this.renderToContext(context);
      context.globalCompositeOperation = 'lighter';
      this.renderToContext(context);

      context.restore();

      Sky.dirty = true;
    }

    if (this.lightImage && Sky.isDark()) {
      context.save();

      context.translate(dude.pos.x - map.originOffsetX - dude.lightImage.width/2,
                        dude.pos.y - map.originOffsetY - dude.lightImage.height/2);

      // center the light source a bit better
      if (dude.direction === LEFT) {
        context.translate(-2, -2);
      } else {
        context.translate(-3, -2);
      }

      context.globalCompositeOperation = 'destination-out';
      context.drawImage(this.lightImage, 0, 0);

      context.restore();
    }

    // blink!
    if (dude.invulnerabilityCounter > 0) {
      var time = dude.invulnerabilityCounter + Math.PI;
      var test = Math.cos(3*time*time);
      this.node[0].style.visibility = (test > 0) ? 'visible' : 'hidden';
    }
    if (dude.invulnerabilityCounter === 0) {
      // need to make sure visibility is turned back on
      this.node[0].style.visibility = 'visible';
    }
  };

  DudeSprite.prototype.hide = function () {
    Sprite.prototype.hide.call(this); // super
    this.aimingArmNode[0].style.visibility = 'hidden';
    Sky.dirty = true;
  };

  DudeSprite.prototype.drawArms = function () {
    var dude = this.model;
    this.aimingArmNode[0].style.visibility = 'hidden';
    if (dude.alive()) {
      var weapon = dude.hands.weapon();
      if (weapon) {
        if (dude.firing && weapon.isMeleeWeapon) {
          this.drawTile(weapon.handsSpriteOffset + 1, 1);
        } else if (dude.firing) {
          this.drawAimedArm(weapon.isHandgun ? 10 : 13);
        } else if (weapon && weapon.isMeleeWeapon) {
          this.drawTile(weapon.handsSpriteOffset, 1);
        } else if (dude.aiming) {
          this.drawAimedArm(weapon.isHandgun ? 9 : 12);
        } else if (weapon && !weapon.isHandgun) {
          this.drawTile(11, 1); // draw arms with rifle
        } else {
          // 7. with gun
          // 8. out with gun
          this.drawTile(7 + (dude.takingDamage ? 1 : 0), 1);
        }
      } else {
        // 5. normal
        // 6. out
        this.drawTile(5 + (dude.takingDamage ? 1 : 0), 1);
      }
      // activate what's in the dude's hands
      dude.hands.renderItems(this);
    }
  };

  DudeSprite.prototype.drawAimedArm = function (frame) {
    var dude = this.model;
    var map = Game.map;
    var style = this.aimingArmNode[0].style;

    var x = dude.pos.x - map.originOffsetX - dude.center.x;
    var y = dude.pos.y - map.originOffsetY - dude.center.y;

    var rot = dude.aimDirection;
    if (dude.direction) {
      x += ARM_FLIP_OFFSET;
      rot -= Math.PI;
    }

    var transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rot + 'rad)';

    if (dude.direction) {
      transform += ' scaleX(-1)';
    }

    if (Game.threeDee) {
      transform += ' translateZ(' + (dude.z + 1) + 'px)';
    } else {
      style.zIndex = dude.z + 1;
    }

    var left = -(frame * this.tileWidth) - this.imageOffset.x;
    var top  = -this.imageOffset.y;

    style[transformKey] = transform;

    style.backgroundPosition = left + 'px ' + top + 'px';

    style.visibility = 'visible';
  };

  return DudeSprite;

});
