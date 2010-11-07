// GridNode

define(["game"], function (game) {

  var background = $('#background');

  var GridNode = function (map) {
    this.map = map;

    this.north = null;
    this.south = null;
    this.east  = null;
    this.west  = null;

    this.nextSprite = null;

    this.tileOffset = Math.floor(Math.random()*2) + 1;
    // this.tileOffset = (Math.random() > 0.9) ? Math.floor(Math.random()*2) + 1 : 0;
    this.tileFlip = (Math.random() > 0.5);

    this.domNode = null;

    this.dupe = {
      horizontal: null,
      vertical:   null
    };

    this.enter = function (sprite) {
      sprite.nextSprite = this.nextSprite;
      this.nextSprite = sprite;
    };

    this.leave = function (sprite) {
      var ref = this;
      while (ref && (ref.nextSprite != sprite)) {
        ref = ref.nextSprite;
      }
      if (ref) {
        ref.nextSprite = sprite.nextSprite;
        sprite.nextSprite = null;
      }
    };

    this.eachSprite = function(sprite, callback) {
      var ref = this;
      while (ref.nextSprite) {
        ref = ref.nextSprite;
        callback.call(sprite, ref);
      }
    };

    this.isEmpty = function (collidables) {
      var empty = true;
      var ref = this;
      while (ref.nextSprite) {
        ref = ref.nextSprite;
        empty = !ref.visible || collidables.indexOf(ref.name) == -1
        if (!empty) break;
      }
      return empty;
    };

    this.render = function (delta, x, y) {
      // nothing to render, return
      if (this.tileOffset == 0) return;

      if (x < -game.gridSize || y < -game.gridSize ||
          x > game.canvasWidth ||
          y > game.canvasHeight) {
        // outside of the view
        if (this.domNode) this.freeDomNode();
      } else {
        if (!this.domNode) this.obtainDomNode();
        this.domNode.css({left:x, top:y});
      }
    };

    this.obtainDomNode = function () {
      if (this.map.freeNodes.length) {
        this.domNode = this.map.freeNodes.pop();
        this.domNode.css({'background-position':game.gridSize * this.tileOffset+' 0px'}).show();
      } else {
        this.domNode = $('<div/>', {'class':'tile'}).css({'background-position':game.gridSize * this.tileOffset+' 0px'});
        background.append(this.domNode);
      }
    };

    this.freeDomNode = function (delta) {
      this.domNode.hide();
      this.map.freeNodes.push(this.domNode);
      this.domNode = null;
    };
  };

  return GridNode;
});
