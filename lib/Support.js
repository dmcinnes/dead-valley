define([], function () {
  var requiredFeatures = {
    audio:           "Audio",
    borderradius:    "border-radius",
    canvas:          "Canvas",
    cssgradients:    "CSS Gradients",
    csstransforms:   "CSS Transforms",
    csstransforms3d: "CSS 3D Transforms",
    localstorage:    "Local Storage",
    multiplebgs:     "Multiple Backgrounds",
    opacity:         "CSS Opacity",
    webworkers:      "Web Workers"
  };

  var missing = [];
  _.each(requiredFeatures, function (desc, feature) {
    if (!Modernizr[feature]) {
      missing.push(desc);
    }
  });

  // get around the chrome 3d transform issue
  if (missing.length === 1 &&
      missing[0] === requiredFeatures.csstransforms3d &&
      window.navigator.userAgent.match(/Chrome/)) {
    console.warn("Modernizr is reporting your browser does not support 3D CSS transforms");
    console.warn("see: http://code.google.com/p/chromium/issues/detail?id=129004");
    console.warn("If you see problems please contact doug@dogwatchgames.com");
    missing.length = 0;
  }

  return {
    allGreen: (missing.length === 0),
    required: requiredFeatures,
    missing:  missing
  };
});
