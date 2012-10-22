define({
  Dude: {
    img: 'dude',
    width: 20,
    height: 20,
    layers: 2,
    center: {
      x: 10,
      y: 11
    },
    collidableOffset: {
      x: 7,
      y: 11
    }
  },
  Zombie: {
    img: 'zombie',
    width: 20,
    height: 22,
    layers: 2,
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
    img: 'honda',
    name: 'Sedan',
    color: 'white',
    width: 24,
    height: 40,
    layers: 6,
    center: {
      x: 12,
      y: 20
    }
  },
  PoliceCar: {
    img: 'police-car',
    name: 'Police Car',
    width: 24,
    height: 42,
    layers: 6,
    center: {
      x: 12,
      y: 21
    }
  },
  Minivan: {
    img: 'minivan',
    color: 'white',
    width: 24,
    height: 48,
    layers: 6,
    center: {
      x: 12,
      y: 24
    }
  },
  Pickup: {
    img: 'pickup',
    color: 'white',
    width: 24,
    height: 48,
    layers: 6,
    center: {
      x: 12,
      y: 24
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
    center: {
      x: 30,
      y: 30
    },
    collidableOffset: {
      x: 12,
      y: 12
    },
    z: 312
  },
  Tree2: {
    img: 'foilage',
    width: 36,
    height: 37,
    imageOffset: {
      x: 132,
      y: 10
    },
    center: {
      x: 18,
      y: 18
    },
    collidableOffset: {
      x: 6,
      y: 6
    },
    z: 311
  },
  Tree3: {
    img: 'foilage',
    width: 25,
    height: 26,
    imageOffset: {
      x: 255,
      y: 17
    },
    center: {
      x: 10,
      y: 10
    },
    collidableOffset: {
      x: 3,
      y: 3
    },
    z: 310
  },
  Smoke: {
    img: 'smoke',
    width: 40,
    height: 40,
    center: {
      x: 20,
      y: 20
    },
    z: 399 // just under sky
  },
  Explosion: {
    img: 'explosion',
    width: 40,
    height: 40,
    center: {
      x: 20,
      y: 20
    },
    z: 399 // just under sky
  },
  StopSign: {
    img: 'objects',
    width: 16,
    height: 17,
    imageOffset: {
      x: 142,
      y: 0
    },
    center: {
      x: 8,
      y: 8
    }
  }
});
