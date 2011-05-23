// marshal and unmarshal sprites

define(function () {

  var unmarshal = function (sprite) {
    return [sprite.name,
            Math.floor(sprite.pos.x),
            Math.floor(sprite.pos.y),
            Math.floor(sprite.pos.rot)].join(',');
  };

  var parseValues = function (spriteString) {
    var values = spriteString.split(',');

    return {
      clazz: values[0],
      x:     parseInt(values[1]),
      y:     parseInt(values[2]),
      rot:   parseInt(values[3])
    };
  };

  var marshal = function (spriteString, callback) {

    var values = parseValues(spriteString);

    require(['sprites/'+values.clazz], function (NewSprite) {
      var sprite = new NewSprite();
      sprite.pos.x = values.x;
      sprite.pos.y = values.y;
      sprite.pos.rot = values.rot;
      callback(sprite);
    });
  };

  var spriteMarshal = function (Thing) {
    Thing.prototype.toString = function () {
      return unmarshal(this);
    };

    // if we know the class we don't have to have a callback
    Thing.marshal = function (spriteString) {
      var values = parseValues(spriteString);
      var sprite     = new Thing();
      sprite.pos.x   = values.x;
      sprite.pos.y   = values.y;
      sprite.pos.rot = values.rot;
      return sprite;
    };
  };

  spriteMarshal.marshal   = marshal;
  spriteMarshal.unmarshal = unmarshal;

  return spriteMarshal;
});
