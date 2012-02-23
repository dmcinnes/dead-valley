// Console

define([], function () {
  var logger = function (type) {
    var func = window.console[type];
    return function () {
      if (!window.DV || window.DV.debug) {
        func.apply(window.console, _.toArray(arguments));
      }
    };
  };

  return {
    log:   logger('log'),
    error: logger('error'),
    warn:  logger('warn')
  };
});
