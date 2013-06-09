define({
  burbs: [
    {"clazz":"Flashlight","percent":0.2,"dice":"1"},
    {"clazz":"BaseballBat","percent":0.1,"dice":"1"},
    {"clazz":"Beans","percent":0.3,"dice":"1d2"},
    {"clazz":"Cake","percent":0.2,"dice":"1"},
    {"clazz":"GasCan","percent":0.05,"dice":"1"},
    {"clazz":"Medkit","percent":0.04,"dice":"1"},
    {"clazz":"RubberTubing","percent":0.05,"dice":"1"},
    {"clazz":"Shotgun","percent":0.07,"dice":"1","ammo":"3d3"},
    {"clazz":"ShotgunShells","percent":0.07,"dice":"3d6","stacked":true},
    {"clazz":"Glock19","percent":0.08,"dice":"1","ammo":"3d5"},
    {"clazz":"Nine_mm","percent":0.08,"dice":"2d6","stacked":true},
    {"clazz":"Remington700","percent":0.07,"dice":"1","ammo":"1d5"},
    {"clazz":"TwoTwoThree","percent":0.07,"dice":"3d6","stacked":"true"}
  ],
  gas_station: [
    {"clazz":"Flashlight","percent":0.1,"dice":"1d2"},
    {"clazz":"BaseballBat","percent":0.05,"dice":"1"},
    {"clazz":"Beans","percent":0.08,"dice":"1d2"},
    {"clazz":"GasCan","percent":0.1,"dice":"1d2"},
    {"clazz":"Medkit","percent":0.01,"dice":"1"},
    {"clazz":"RubberTubing","percent":0.02,"dice":"1"},
    {"clazz":"Shotgun","percent":0.08,"dice":"1","ammo":9},
    {"clazz":"ShotgunShells","percent":0.06,"dice":"5d6","stacked":true},
    {"clazz":"Wrench","percent":0.1,"dice":"1"}
  ],
  police_station: [
    {"clazz":"Flashlight","percent":0.3,"dice":"1d2"},
    {"clazz":"Medkit","percent":0.08,"dice":"1d2"},
    {"clazz":"Shotgun","percent":0.9,"dice":"1d3","ammo":9},
    {"clazz":"ShotgunShells","percent":1,"dice":"5d6","stacked":true},
    {"clazz":"ShotgunShells","percent":1,"dice":"5d6","stacked":true},
    {"clazz":"ShotgunShells","percent":1,"dice":"5d6","stacked":true},
    {"clazz":"Glock19","percent":1,"dice":"1d5","ammo":15},
    {"clazz":"Nine_mm","percent":1,"dice":"6d10","stacked":true},
    {"clazz":"Nine_mm","percent":1,"dice":"6d10","stacked":true},
    {"clazz":"Nine_mm","percent":1,"dice":"6d10","stacked":true},
    {"clazz":"Remington700","percent":0.07,"dice":"1","ammo":"1d5"},
    {"clazz":"TwoTwoThree","percent":0.5,"dice":"6d10","stacked":"true"},
    {"clazz":"TwoTwoThree","percent":0.5,"dice":"6d10","stacked":"true"}
  ],
  hotdog_stand: [
    {"clazz":"RubberTubing","percent":1,"dice":"1"}
  ],
  start: [
    {"clazz":"Beans","percent":1,"dice":"8d12"},
    {"clazz":"Glock19","percent":1,"dice":"1","ammo":15}
  ]
});
