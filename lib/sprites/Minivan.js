define(['Vector', 'Game', 'Car'], function (Vector, Game, Car) {
  // http://en.wikipedia.org/wiki/Automobile_drag_coefficient
  var config = {
    spriteConfig: 'Minivan',
    mass:         250,  // kg
    dragArea:     0.800,
    steeringLock: 43.0, // degrees
    // 140 HP * 3000 RPM / 5252 = ft/lbs and * 3 px/ft * 2.2 lbs/kg
    engineTorque: (120 * 3000 * 3 * 2.2) / 5252,
    brakeTorque:  2200,
    wheelRadius:  1,
    wheelPositions: [
      new Vector(-10, -18),
      new Vector( 10, -18),
      new Vector(-10,  18),
      new Vector( 10,  18)
    ],
    driversSide: new Vector(-26, -4),
    cargoSpace: {
      width:  9,
      height: 6
    },
    fuelCapacity: 10,
    mpg: 15
  };

  var Minivan = function () {
    var car = new Car(config);
    return car;
  };

  return Minivan;
});
