define(['Sprite', 'Collidable'], function (Sprite, Collidable) {

  var Tree = function (type) {
    this.init(type || 'Tree1');
    this.tileOffset = 60;
    this.mass    = Number.MAX_VALUE;
    this.inertia = Number.MAX_VALUE;
  };
  Tree.prototype = new Sprite();
  Tree.prototype.stationary = true;
  Tree.prototype.description = 'Tree';

  Collidable(Tree, { ignore: ['Tree'] });

  return Tree;
});
