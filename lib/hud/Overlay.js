define(function () {

  var mouseEvents = "click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave";

  return function (overlay) {
    overlay.bind(mouseEvents, function (e) {
      e.stopImmediatePropagation();
      return false;
    });
  };

});
