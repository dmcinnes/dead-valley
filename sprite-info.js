define(function () {

  return {
    Dude: {
      img: 'dude',
      width: 20,
      height: 20,
      layers: 2,
      imageOffset: {
        x: 0,
        y: 0
      },
      center: {
        x: 10,
        y: 11
      },
      collidableOffset: {
        x: 5,
        y: 8
      }
    },
    Zombie: {
      img: 'zombie',
      width: 20,
      height: 22,
      layers: 2,
      imageOffset: {
        x: 0,
        y: 0
      },
      center: {
        x: 10,
        y: 12
      },
      collidableOffset: {
        x: 10,
        y: 12
      }
    },
    Honda: {
      img: 'car1',
      width: 24,
      height: 40,
      layers: 6,
      imageOffset: {
        x: 0,
        y: 0
      },
      center: {
        x: 12,
        y: 20
      }
    },
    Barrel: {
      img: 'objects',
      width: 16,
      height: 16,
      imageOffset: {
        x: 60,
        y: 0
      },
      center: {
        x: 8,
        y: 8
      }
    },
    GasPump1: {
      img: 'objects',
      width: 28,
      height: 16,
      imageOffset: {
        x: 0,
        y: 0
      },
      center: {
        x: 18,
        y: 5
      },
      collidableOffset: {
        x: 10.5,
        y: 5
      },
      z: 90
    },
    GasPump2: {
      img: 'objects',
      width: 32,
      height: 17,
      imageOffset: {
        x: 28,
        y: 0
      },
      center: {
        x: 11,
        y: 9
      },
      collidableOffset: {
        x: 10.5,
        y: 5
      },
      z: 90
    },
    Tree1: {
      img: 'foilage',
      width: 60,
      height: 60,
      imageOffset: {
        x: 0,
        y: 0
      },
      center: {
        x: 30,
        y: 30
      },
      collidableOffset: {
        x: 10,
        y: 10
      },
    },
    Tree2: {
      img: 'foilage',
      width: 36,
      height: 34,
      imageOffset: {
        x: 72,
        y: 12
      },
      center: {
        x: 18,
        y: 17
      },
      collidableOffset: {
        x: 3,
        y: 3
      },
    },
    Tree3: {
      img: 'foilage',
      width: 20,
      height: 19,
      imageOffset: {
        x: 139,
        y: 20
      },
      center: {
        x: 10,
        y: 10
      },
      collidableOffset: {
        x: 1,
        y: 1
      },
    },
    Tree4: {
      img: 'foilage',
      width: 57,
      height: 57,
      imageOffset: {
        x: 183,
        y: 2
      },
      center: {
        x: 28,
        y: 28
      },
      collidableOffset: {
        x: 9,
        y: 9
      },
    }
  };

});
