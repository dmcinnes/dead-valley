// GridNode

define(["game"], function (game) {

  var background = $('#background');

  var GridNode = function (level) {
    this.level = level;

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

    this.render = function (delta, offsetX, offsetY) {
      if (this.tileOffset == 0) return;

      if (this.domNode) {
        this.domNode.css({left:offsetX, top:offsetY});
      } else {
        if (this.level.freeNodes.length) {
          this.domNode = this.level.freeNodes.pop();
          this.domNode.css({left:offsetX, top:offsetY, 'background-position':game.gridSize * this.tileOffset+' 0px'}).show();
        } else {
          this.domNode = $('<div/>', {'class':'tile'}).css({left:offsetX, top:offsetY, 'background-position':game.gridSize * this.tileOffset+' 0px'});
          background.append(this.domNode);
        }
      }
    };

    this.reclaim = function (delta) {
      if (this.domNode) {
        this.domNode.hide();
        level.freeNodes.push(this.domNode);
        this.domNode = null;
      }
    };
  };

  return GridNode;
});
