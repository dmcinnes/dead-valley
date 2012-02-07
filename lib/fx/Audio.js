define(['fx/audio-list'], function (audioList) {

  var channelCount = 4;

  var Sound = function (filename) {
    var instances = [];
    var src = "assets/audio/" + filename + ".wav";

    for (var i = 0; i < channelCount; i++) {
      var instance = new Audio();
      instance.src = src;
      // preload the audio so there isn't a lag when it's first played
      instance.muted = true;
      instance.play();
      instances.push(instance);
    }

    this.instances = instances;
    this.current = 0;
  };

  Sound.prototype = {
    play: function (callback) {
      var self = this;
      var instance = this.instances[this.current];
      instance.muted = false;
      if (callback) {
        $(instance).one('ended', function () {
          callback(self);
        });
      }
      instance.currentTime = 0;
      instance.play();
      this.current = (this.current + 1) % this.instances.length;
    }
  };

  var AudioManager = {};

  _.each(audioList, function (versions, name) {
    AudioManager[name] = {};
    _.each(versions, function (version) {
      var filename = name + '-' + version;
      AudioManager[name][version] = new Sound(filename);
    });
  });

  return AudioManager;
});
