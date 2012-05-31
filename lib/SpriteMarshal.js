// marshal and unmarshal sprites

define([], function () {

  var unmarshal = function (sprite) {
    return JSON.stringify(sprite.saveMetadata());
  };

  // recursive function to marshal all the data on the object
  var setValues = function (object, values) {
    if (!object) return;
    for (var val in values) {
      if (values.hasOwnProperty(val)) {
        var value  = values[val]; // new value we're setting
        var target = object[val]; // current value on the target object

      // if object target prop is a function call is with
      // the value
        if (typeof(target) === 'function') {
          target.call(object, value);
      // if value to set is not an object then set the
      // value directly
      // do it this weird way because we want to support
      // null values and:
      // typeof(null) === 'object' // WAT
        } else if (typeof(value) !== 'object') {
          object[val] = value;
      // otherwise the value is an object so recurse
        } else {
          setValues(target, value);
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
