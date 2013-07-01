define(['Game', 'SpriteModel', 'fx/BulletHit', 'Vector', 'fx/Audio'],
       function (Game, SpriteModel, BulletHit, Vector, Audio) {

  var MAX_LIFE = 0.2; // in seconds

  var sparks = new BulletHit({
    color:     '#400',
    minLength: 50,
    range:     150,
    lifetime:  0.3,
    size:      5
  });

  var Explosion = function (origin) {
    this.init('Explosion');

    this.frame = Math.floor(Math.random() * 4);
    this.life  = 0;
    this.scale = 0.1;

    this.pos.rot = 360 * Math.random();

    this.originObject = origin;

    Game.events.fireEvent('explosion', this);
  };
  Explosion.prototype = new SpriteModel();
  Explosion.prototype.stationary  = true;
  Explosion.prototype.fx          = true;

  Explosion.prototype.preMove = function (delta) {
    this.scale   += 20 * delta;
    this.opacity -= delta;
  };

  Explosion.prototype.postMove = function (delta) {
    if (this.life === 0) {
      this.pushBackSprites();

      if (this.pos.subtract(Game.dude.pos).magnitude() < 600) {
        Audio.explosion.playRandom();
      }
    }

    this.life += delta;

    if (this.life > MAX_LIFE) {
      this.die();
    }
  };

  Explosion.prototype.pushBackSprites = function () {
    var self = this;
    var node = Game.map.getNodeByWorldCoords(this.pos.x, this.pos.y);
    _.each(node.nearby(), function (sprite) {
      var vector = sprite.pos.subtract(this.pos);
      var distance = vector.magnitude();
      if (!sprite.stationary && sprite.isRigidBody) {
        sprite.pos.translate(vector.normalize().scale(20));
      }
      if (sprite.takeDamage) {
        var damage = Math.round(2000 / (distance * distance));
        sprite.takeDamage(damage, sprite.pos, self);
      }
    }, this);
  };

  Explosion.prototype.z = 150;

  Explosion.createNew = function (position, originObject) {
    var sparkCount = 5;
    for (var i = 0; i < sparkCount; i++) {
      sparks.fireSparks({
        point:     position,
        normal:    Vector.create(360 * Math.random()),
        direction: Vector.create(360 * Math.random())
      });
    }
    var explosion = new Explosion(originObject);
    explosion.pos.set(position);

    Game.addSprite(explosion);
  };

  return Explosion;
});
