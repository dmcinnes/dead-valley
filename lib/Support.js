define([], function () {
  var requiredFeatures = {
    audio:           "Audio",
    canvas:          "Canvas",
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

  return {
    allGreen: (missing.length === 0),
    required: requiredFeatures,
    missing: missing
  };
});
