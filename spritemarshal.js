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
        if (typeof(value) === 'object') {
          setValues(target, value);
        } else {
          switch (typeof(target)) {
            case 'number':
              object[val] = parseInt(value);
              break;
            case 'function':
              target.call(object, value);
              break;
            default:
              object[val] = value;
              break;
          }
        }
      }
    }
  };

  var marshal = function (spriteString, callback) {
    var values = JSON.parse(spriteString);

    // load the class specified in the sprite string
    require(['sprites/'+values.clazz], function (NewSprite) {
      var sprite = new NewSprite();
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
