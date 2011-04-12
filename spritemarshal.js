define(function () {
  var spriteMarshal = function (thing) {
    thing.prototype.toString = function () {
      return [this.name,
	      Math.floor(this.pos.x),
	      Math.floor(this.pos.y),
	      Math.floor(this.pos.rot)].join(',');
    };
  };

  spriteMarshal.marshal = function (spriteString, callback) {
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

  return spriteMarshal;
});
