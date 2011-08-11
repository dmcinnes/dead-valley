define(['sprite', 'collidable'], function (Sprite, collidable) {

  var Tree = function (type) {
    this.init(type || 'Tree1');
    this.mass    = Number.MAX_VALUE;
    this.inertia = Number.MAX_VALUE;
  };
  Tree.prototype = new Sprite();

  Tree.prototype.setType(type) {
  };

  // Trees don't move
  Tree.prototype.move = function (delta) {};
  Tree.prototype.transformNormals = function () {};

  collidable(Tree);

  return Tree;
});
