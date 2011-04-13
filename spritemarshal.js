// marshal and unmarshal sprites

define(function () {

  var unmarshal = function (sprite) {
    return [sprite.name,
            Math.floor(sprite.pos.x),
            Math.floor(sprite.pos.y),
            Math.floor(sprite.pos.rot)].join(',');
  };

  var marshal = function (spriteString, callback) {
    var values, clazz, x, y, rot;

    values = spriteString.split(',');
    clazz = values[0];
    x     = parseInt(values[1]);
    y     = parseInt(values[2]);
    rot   = parseInt(values[3]);

    require(['objects/'+clazz], function (NewSprite) {
      var sprite = new NewSprite();
      sprite.pos.x = x;
      sprite.pos.y = y;
      sprite.pos.rot = rot;
      callback(sprite);
    });
  };

  var spriteMarshal = function (thing) {
    thing.prototype.toString = function () {
      return unmarshal(this);
    };
  };

  spriteMarshal.marshal   = marshal;
  spriteMarshal.unmarshal = unmarshal;

  return spriteMarshal;
});
