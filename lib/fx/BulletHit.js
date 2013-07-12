define(['Game', 'models/Sparks'], function (Game, Sparks) {

  // length and range are negitive because the default
  // is to send sparks back toward the shooter
  var defaultConfig = {
    color:     'white',
    minLength: -5,
    range:     -10,
    lifetime:  0.2,
    size:      1
  };

  var BulletHit = function (config) {
    this.config = $.extend({}, defaultConfig, config);
  };

  BulletHit.prototype.fireSparks = function (result) {
    Game.addSprite(new Sparks(result, this.config));
  };

  return BulletHit;
});
