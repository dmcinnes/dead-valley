define(['Game', 'Console', 'fx/audio-list', 'Progress'], function (Game, Console, audioList, Progress) {

  var channelCount = 1;

  var Sound = function (filename) {
    var instances = [];
    var src = "assets/audio/" + filename + ".mp3";

    for (var i = 0; i < channelCount; i++) {
      Progress.onStart(function () {
        var instance = soundManager.createSound({
          autoLoad: true,
          id: filename,
          url: src,
          onload: function () {
            instances.push(instance);
            Progress.increment();
          }
        });
      });
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
    },
    playRandom: function () {
      var sounds = _.values(this);
      var selection = Math.floor(Math.random() * sounds.length);
      sounds[selection].play();
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

    Game.events.subscribe('pause', function () {
      soundManager.mute();
    }).subscribe('play', function () {
      soundManager.unmute();
    }).subscribe('game over', function () {
      _.invoke(Audio, 'stopAll');
    });

    Progress.audioLoaded();

    // TODO trigger this when the audio had finished loading
    Game.events.fireEvent("audio loaded");
  });

  soundManager.ontimeout(function() {
    Console.log('Audio failed to initialize.');

    var fakeSound = {
      play: function (callback) {
        if (callback) {
          callback();
        }
      },
      loop: function () {},
      stop: function () {}
    };
    _.each(audioList, function (versions, name) {
      var group = new SoundGroup();
      _.each(versions, function (version) {
        group[version] = fakeSound;
      });
      Audio[name] = group;
    });

    Progress.audioLoaded();

    Game.events.fireEvent("audio loaded");
  });

  return Audio;
});
