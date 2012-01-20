// BuildingMarshal

define(['Building'], function (Building) {

  var BuildingMarshal = {

    marshal: function (buildingObj, offset) {
      var pointsArr = buildingObj.points;
      var inventory = buildingObj.inventory;

      var points = [];
      for (var i = 0; i < pointsArr.length; i += 2) {
        var point = offset.add({x:pointsArr[i], y:pointsArr[i+1]});
        points.push(point);
      }

      var building  = new Building(points);
      building.name = buildingObj.name;

      building.inventory.setInventory(inventory);
      building.inventory.name = building.name;

      building.zombies = buildingObj.zombies;

      // save this so we can use it later for unmarshalling
      building.buildingObject = buildingObj;

      return building;
    },

    unmarshal: function (building) {
      // use the original building object
      var obj = building.buildingObject;
      obj.inventory = building.inventory.saveMetadata().setInventory;
      return obj;
    }

  };

  return BuildingMarshal;
});
