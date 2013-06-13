// marshal and unmarshal sprites

define([], function () {

  // so sprites who need to load other files
  // will work correctly
  var Complete = function (callback) {
    this.count = 1;
    this.callback = callback;
  };
  Complete.prototype.another = function () {
    this.count++;
  };
  Complete.prototype.done = function () {
    this.count--;
    if (this.count === 0) {
      this.callback();
    }
  };


  var unmarshal = function (sprite) {
    try {
      return JSON.stringify(sprite.saveMetadata());
    } catch(e) {
      Console.error(e);
    }
  };

  // recursive function to marshal all the data on the object
  var setValues = function (object, values, complete) {
    if (!object) return;
    for (var val in values) {
      if (values.hasOwnProperty(val)) {
        var value  = values[val]; // new value we're setting
        var target = object[val]; // current value on the target object

      // if object target prop is a function call is with
      // the value
        if (typeof(target) === 'function') {
          target.call(object, value, complete);
      // if value to set is not an object then set the
      // value directly
      // do it this weird way because we want to support
      // null values and:
      // typeof(null) === 'object' // WAT
        } else if (typeof(value) !== 'object') {
          object[val] = value;
      // otherwise the value is an object so recurse
        } else {
          setValues(target, value, complete);
        }
      }
    }
  };

  var marshal = function (spriteString, callback) {
    var sprite;
    var values = JSON.parse(spriteString);

    var complete = new Complete(function () {
      callback(sprite);
    });

    // load the class specified in the sprite string
    require(['sprites/'+values.clazz], function (NewSprite) {
      sprite = new NewSprite(values.type);
      setValues(sprite, values, complete);
      complete.done();
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
