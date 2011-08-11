// marshal and unmarshal sprites

define(function () {

  var unmarshal = function (sprite) {
    return JSON.stringify(sprite.saveMetadata());
  };

  // recursive function to marshal all the data on the object
  var setValues = function (object, values) {
    if (!object) return;
    for (var val in values) {
      if (values.hasOwnProperty(val)) {
        var value  = values[val];
        var target = object[val];
        if (typeof(target) === 'function') {
          target.call(object, value);
        } else if (typeof(value) === 'object') {
          setValues(target, value);
        } else {
          object[val] = value;
        }
      }
    }
  };

  var marshal = function (spriteString, callback) {
    var values = JSON.parse(spriteString);

    // load the class specified in the sprite string
    require(['sprites/'+values.clazz], function (NewSprite) {
      var sprite = new NewSprite(values.type);
      setValues(sprite, values);
      callback(sprite);
    });
  };

  var spriteMarshal = function (Thing) {
    Thing.prototype.toString = function () {
      return unmarshal(this);
    };

    // if we know the class we don't have to have a callback
    Thing.marshal = function (spriteString) {
      var values = JSON.parse(spriteString);
      var sprite = new Thing();
      setValues(sprite, values);
      return sprite;
    };
  };

  spriteMarshal.marshal   = marshal;
  spriteMarshal.unmarshal = unmarshal;

  return spriteMarshal;
});
