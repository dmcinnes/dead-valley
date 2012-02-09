define(['Game', 'fx/audio-list'], function (Game, audioList) {

  var channelCount = 1;

  var Sound = function (filename) {
    var instances = [];
    var src = "assets/audio/" + filename + ".mp3";

    for (var i = 0; i < channelCount; i++) {
      var instance = soundManager.createSound({
        autoLoad: true,
        id: filename,
        url: src
      });
      instances.push(instance);
    }

    this.instances = instances;
    this.current = 0;
  };

  Sound.prototype = {
    play: function (callback) {
      var self = this;
      var instance = this.instances[this.current];
      instance.play({
        onfinish: callback
      });
      this.current = (this.current + 1) % this.instances.length;
    },
    loop: function () {
      var instance = this.instances[this.current];
      instance.play({
        loops: 999
      });
      this.current = (this.current + 1) % this.instances.length;
    },
    stop: function () {
      _.invoke(this.instances, 'stop');
    }
  };

  var SoundGroup = function () {
  };

  SoundGroup.prototype = {
    stopAll: function () {
      _.invoke(this, 'stop');
    }
  };

  var Audio = {};

  soundManager.onready(function() {
    _.each(audioList, function (versions, name) {
      var group = new SoundGroup();
      _.each(versions, function (version) {
        var filename = name + '-' + version;
        group[version] = new Sound(filename);
      });
      Audio[name] = group;
    });
  });

  Game.events.subscribe('pause', function () {
    soundManager.mute();
  }).subscribe('play', function () {
    soundManager.unmute();
  });

  return Audio;
});
