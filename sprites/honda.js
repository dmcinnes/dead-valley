define(['game', 'car'], function (game, Car) {
  // http://en.wikipedia.org/wiki/Automobile_drag_coefficient
  var config = {
    name:         'Honda',
    mass:         225,  // kg
    dragArea:     0.654,
    steeringLock: 43.0, // degrees
    // 140 HP * 3000 RPM / 5252 = ft/lbs and * 3 px/ft * 2.2 lbs/kg
    engineTorque: (140 * 3000 * 3 * 2.2) / 5252,
    brakeTorque:  40,
    wheelRadius:  1,
    wheelPositions: [
      new Vector(-10, -12),
      new Vector( 10, -12),
      new Vector(-10,  12),
      new Vector( 10,  12)
    ],
    driversSide: new Vector(-26, -4)
  };

  var Honda = function () {
    return new Car(config);
  };

  return Honda;

});
