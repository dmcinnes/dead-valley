define(["Vector",
        "Sprite",
        "Collidable",
        "Game",
        "fx/BulletHit",
        "fx/BloodSplatter",
        "fx/Audio",
        "Reporter",
        "Sky"],

        function(Vector,
                 Sprite,
                 Collidable,
                 Game,
                 BulletHit,
                 BloodSplatter,
                 Audio,
                 Reporter,
                 Sky) {

  var LEFT  = true;  // true, meaning do flip the sprite
  var RIGHT = false;

  var WALKING_ANIMATION_FRAME_RATE   = 2;    // in pixels
  var ATTACKING_ANIMATION_FRAME_RATE = 0.10; // in seconds
  var DYING_ANIMATION_FRAME_RATE     = 0.25; // in seconds
  var DEAD_BODY_LIFE                 = 45;   // in seconds
  var DEAD_BODY_FADE                 = 5;    // in seconds

  var ZombieSprite = function (model) {
    this.init(model);

    // set walking counter randomly so not all zombies are in sync
    this.walkingFrame          = 0;
    this.walkingFrameCounter   = WALKING_ANIMATION_FRAME_RATE * Math.random();

    this.originalCenterX = model.center.x;
  };
  ZombieSprite.prototype = new Sprite();

  // HACK
  ZombieSprite.prototype.modifyForPronePosition = function () {
    var model = this.model;

    // so we render correctly
    this.node.width(30);
    this.imageOffset.x  = 10;
    model.center.y      -= 6;
    model.pos.y         -= 6;
  };

  ZombieSprite.prototype.draw = function (delta) {
    var model = this.model;

    // hack so the sprite is placed correctly when its flipped
    model.center.x = (model.direction == RIGHT) ? this.originalCenterX : this.originalCenterX + 4;

    if (model.health <= 0) {
      // reusing the walking frame and counter
      if (this.walkingFrameCounter < 0.5) {
        this.walkingFrameCounter += delta;
        this.drawTile(10, 0);
      } else {
        if (!this.prone) {
          this.prone = true;
          this.modifyForPronePosition();
        }
        this.drawTile(11, 0);
        // fade away
        if (DEAD_BODY_LIFE - this.waitTimeout < DEAD_BODY_FADE) {
          this.opacity = 1 - (DEAD_BODY_FADE - DEAD_BODY_LIFE + this.waitTimeout) / DEAD_BODY_FADE;
        }
      }
      return;
    }

    if (model.walking) {
      this.walkingFrameCounter += delta * model.vel.magnitude();
      if (this.walkingFrameCounter > WALKING_ANIMATION_FRAME_RATE) {
        this.walkingFrameCounter = 0;
        this.walkingFrame = (this.walkingFrame + 1) % 4; // four frames
      }
      this.drawTile(this.walkingFrame+1, 0); // starts at 1
    } else {
      this.drawTile(0, 0); // standing
    }
    
    // arms
    if (model.elapsedAttackTime > 0) {
      var attackingFrame = Math.round((model.elapsedAttackTime / model.ATTACK_SPEED) * 4); // four frames
      this.drawTile(attackingFrame+6, 1); // starts at 6
    } else if (this.walking) {
      this.drawTile(6, 1); // walking arms
    } else {
      this.drawTile(5, 1); // standing arms
    }
  };

  ZombieSprite.prototype.render = function (delta) {
    Sprite.prototype.render.call(this, delta);

    var context = Game.skyContext;
    var map = Game.map;
    var model = this.model;

    // make lighter when taking damage
    if (model.takingDamage && this.imageData) {
      context.save();
      context.translate(model.pos.x - map.originOffsetX - model.center.x,
                        model.pos.y - map.originOffsetY - model.center.y);
      if (model.direction === LEFT) {
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
  };

  return ZombieSprite;
});
