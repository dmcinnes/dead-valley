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
        if (typeof(values[val]) === 'object') {
          setValues(object[val], values[val]);
        } else if (typeof(object[val]) === 'number') {
          object[val] = parseInt(values[val]);
        } else {
          object[val] = values[val];
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
