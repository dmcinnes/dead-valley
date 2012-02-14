define(function () {

  var mouseEvents = "dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave";

  var stopHandler = function (e) {
    e.stopImmediatePropagation();
    return false;
  };

  return function (overlay, mousedownHandler) {
    overlay.bind(mouseEvents, stopHandler);
    overlay.click(mousedownHandler || stopHandler);
  };

});
