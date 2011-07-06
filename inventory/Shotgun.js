// The Ubiquitous Shotgun

define(['game', 'Firearm', 'inventory/ShotgunShells', 'inventory/InventoryItem'],
       function (game, Firearm, ShotgunShells, InventoryItem) {
  var numberOfPellets = 9;
  var spreadFactor = Math.tan(Math.PI / 18); // actually 1/2 of the spread

  var Shotgun = function () {
    // start with fully loaded for now
    this.reload();
  };
  Shotgun.prototype = new Firearm();

  Shotgun.prototype.damage       = 1; // though each round fires nine pellets
  Shotgun.prototype.ammoCapacity = 9;
  Shotgun.prototype.range        = 300;

  Shotgun.prototype.traceBullet = function (start, end) {
    var damage = this.damage;
    var vector = end.subtract(start);
    var spreadDistance = vector.magnitude() * spreadFactor;
    var offsetVector = vector.normal().normalize();

    for (var i = 0; i < 9; i++) {
      var spread = spreadDistance * (1 - 2 * Math.random());
      var pelletEnd = end.add(offsetVector.multiply(spread));
      game.map.rayTrace(start, pelletEnd, this.range, function (result, sprite) {
        if (result) { // hit!
          sprite.bulletHit(result, damage);
        }
      });
    }
  };

  InventoryItem(Shotgun, {
    width:   2, 
    height:  3, 
    image:   'shotgun',
    accepts: [ShotgunShells]
  });

  return Shotgun;
});
