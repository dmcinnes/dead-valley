define(['Sprite', 'Collidable'], function (Sprite, Collidable) {

  var Tree = function (type) {
    this.init(type || 'Tree1');
    this.mass       = Number.MAX_VALUE;
    this.inertia    = Number.MAX_VALUE;
    // this.layers     = 2; // one for trunk, one for leaves
    this.tileOffset = 60;
  };
  Tree.prototype = new Sprite();

  Tree.prototype.collidesWith = ['Dude', 'Car', 'Zombie'];

  // Tree.prototype.draw = function (delta) {
  //   this.drawTile(1, 0); // draw trunk
  //   this.drawTile(0, 1); // draw leaves
  // };

  // Trees don't move
  Tree.prototype.move = function (delta) {};
  Tree.prototype.transformNormals = function () {};

  Collidable(Tree);

  return Tree;
});
