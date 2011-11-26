define(['Sprite', 'Collidable'], function (Sprite, Collidable) {

  var Tree = function (type) {
    this.init(type || 'Tree1');
    this.mass       = Number.MAX_VALUE;
    this.inertia    = Number.MAX_VALUE;
    // this.layers     = 2; // one for trunk, one for leaves
    this.tileOffset = 60;
  };
  Tree.prototype = new Sprite();
  Tree.prototype.stationary = true;

  Tree.prototype.collidesWith = ['Dude', 'Car', 'Zombie'];

  Collidable(Tree);

  return Tree;
});
