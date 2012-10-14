define(['Vector', 'Game', 'Car'], function (Vector, Game, Car) {
  // http://en.wikipedia.org/wiki/Automobile_drag_coefficient
  var config = {
    spriteConfig: 'Honda',
    mass:         225/2,  // kg
    dragArea:     0.654,
    steeringLock: 43.0, // degrees
    // 140 HP * 3000 RPM / 5252 = ft/lbs and * 3 px/ft * 2.2 lbs/kg
    engineTorque: (120 * 3000 * 3 * 2.2) / 5252,
    brakeTorque:  2200,
    wheelRadius:  1,
    wheelPositions: [
      Vector.create(-10, -12, true),
      Vector.create( 10, -12, true),
      Vector.create(-10,  12, true),
      Vector.create( 10,  12, true)
    ],
    driversSide: Vector.create(-26, -4, true),
    cargoSpace: {
      width:  4,
      height: 7
    },
    fuelCapacity: 10,
    mpg: 30
  };

  var Honda = function () {
    var car = new Car(config);
    return car;
  };

  return Honda;
});
