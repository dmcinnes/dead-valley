define(['Vector', 'Game', 'Car'], function (Vector, Game, Car) {
  // http://en.wikipedia.org/wiki/Automobile_drag_coefficient
  var config = {
    spriteConfig: 'Pickup',
    mass:         250,  // kg
    dragArea:     0.800,
    steeringLock: 43.0, // degrees
    // 140 HP * 3000 RPM / 5252 = ft/lbs and * 3 px/ft * 2.2 lbs/kg
    engineTorque: 2 * (120 * 3000 * 3 * 2.2) / 5252,
    brakeTorque:  2500,
    wheelRadius:  1.5,
    wheelPositions: [
      Vector.create(-10, -18, true),
      Vector.create( 10, -18, true),
      Vector.create(-10,  18, true),
      Vector.create( 10,  18, true)
    ],
    driversSide: Vector.create(-26, -4, true),
    cargoSpace: {
      width:  6,
      height: 8
    },
    fuelCapacity: 20,
    mpg: 15
  };

  var Pickup = function () {
    var car = new Car(config);
    return car;
  };

  return Pickup;
});
