// LifeMeter

define(['Game'], function (Game) {

  var totalContainers, width, leftHalf, rightHalf;

  var $life  = $('#life');
  var $heart = $("<div>&hearts;</div>").addClass('heart');

  var fullHeart = function () {
    return $heart.clone().addClass('full');
  };

  var emptyHeart = function () {
    return $heart.clone().addClass('empty');
  };

  var leftHeart = function () {
    return $heart.clone().addClass('left-half').width(leftHalf);
  };

  var rightHeart = function () {
    // give the full part of the half heart the extra pixel
    return $heart.clone().addClass('right-half').width(rightHalf);
  };

  // determine width
  $life.append($heart);
  width = $heart.width();
  if (width % 2 === 1) { // odd
    // give the left half the extra pixel
    leftHalf  = Math.round(width / 2);
    rightHalf = leftHalf - 1;
  } else { // even
    leftHalf  = width / 2;
    rightHalf = leftHalf;
  }

  $heart.remove();

  var render = function (life) {
    if (life < 0) {
      life = 0;
    }
    $life.empty();
    var i;
    var fullCount  = Math.floor(life / 2);
    var halfCount  = life % 2;
    var emptyCount = totalContainers - fullCount - halfCount;
    for (i = 0; i < fullCount; i++) {
      $life.append(fullHeart());
    }
    if (halfCount) {
      $life.append(leftHeart());
      $life.append(rightHeart());
    }
    for (i = 0; i < emptyCount; i++) {
      $life.append(emptyHeart());
    }
  };

  Game.events.subscribe('new dude', function (dude) {

    // update width of the life div
    totalContainers = Math.round(dude.maxHealth / 2);
    // add an extra container for padding
    $life.width(width * (totalContainers + 1));

    // render current dude's health
    render(dude.health);

    // subscribe to future updates
    dude.subscribe('health changed', function (newValue) {
      render(newValue);
    });
  });

});
