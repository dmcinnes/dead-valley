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
      instance.loop = false;
      if (callback) {
        $(instance).one('ended', function () {
          callback(self);
        });
      }
      instance.currentTime = 0;
      instance.play();
      this.current = (this.current + 1) % this.instances.length;
    },
    loop: function () {
      var instance = this.instances[this.current];
      instance.loop = true;
      instance.muted = false;
      instance.currentTime = 0;
      instance.play();
      this.current = (this.current + 1) % this.instances.length;
      instance = this.instances[this.current];
      instance.loop = true;
      instance.muted = false;
      window.setTimeout(function () {
        instance.currentTime = 0;
        instance.play();
      }, 1000);
    },
    stop: function () {
      _.invoke(this.instances, 'pause');
    }
  };

  var SoundGroup = function () {
  };

  SoundGroup.prototype = {
    stopAll: function () {
      _.invoke(this, 'stop');
    }
  };

  var AudioManager = {};

  _.each(audioList, function (versions, name) {
    var group = new SoundGroup();
    _.each(versions, function (version) {
      var filename = name + '-' + version;
      group[version] = new Sound(filename);
    });
    AudioManager[name] = group;
  });

  return AudioManager;
});
