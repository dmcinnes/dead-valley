// The Ubiquitous Shotgun

define(['Game', 'Firearm', 'inventory/ShotgunShells', 'inventory/InventoryItem'],
       function (Game, Firearm, ShotgunShells, InventoryItem) {
  var numberOfPellets = 9;
  var spreadFactor = Math.tan(Math.PI / 18); // actually 1/2 of the spread

  var Shotgun = function () {
    // start with fully loaded for now
    this.reload();
  };
  Shotgun.prototype = new Firearm();

  Shotgun.prototype.damage       = 1; // though each round fires nine pellets
  Shotgun.prototype.ammoCapacity = 9;
  Shotgun.prototype.ammoType     = ShotgunShells;
  Shotgun.prototype.range        = 300;
  Shotgun.prototype.audio        = 'shotgun';

  Shotgun.prototype.traceBullet = function (start, end) {
    var self = this;
    var vector = end.subtract(start);
    var spreadDistance = vector.magnitude() * spreadFactor;
    var offsetVector = vector.normal().normalize();

    for (var i = 0; i < 9; i++) {
      var spread = spreadDistance * (1 - 2 * Math.random());
      var pelletEnd = end.add(offsetVector.multiply(spread));
      Game.map.rayTrace(start, pelletEnd, this.range + spreadDistance, function (result, sprite) {
        if (result) { // hit!
          sprite.bulletHit(result, self.damage, self);
        }
      });
    }
  };

  InventoryItem(Shotgun, {
    width:       2, 
    height:      3, 
    image:       'shotgun',
    accepts:     [ShotgunShells],
    clazz:       'Shotgun',
    description: "Mossberg 590 Shotgun",
    dropScale:   0.25
  });

  return Shotgun;
});
