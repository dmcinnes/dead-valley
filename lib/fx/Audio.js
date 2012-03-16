define(['Game', 'Console', 'fx/audio-list', 'Progress'], function (Game, Console, audioList, Progress) {

  var channelCount = 2;

  SoundJS.setMasterVolume(0.5);

  SoundJS.onSoundLoadComplete = function (element, name, index) {
    Progress.increment();
  };
  SoundJS.onSoundLoadError = function (element, name, index) {
    Console.log("Failed to load " + name);
    Progress.increment();
  };

  SoundJS.onSoundEnded = function (element, name, index) {
    if (callbacks[name]) {
      var callback = callbacks[name];
      delete callbacks[name];
      callback();
    }
  };

  var callbacks = {};

  var Sound = function (filename) {
    this.name = filename;
    var src = "assets/audio/" + filename + ".mp3";

    Progress.onStart(function () {
      SoundJS.add(filename, src, channelCount);
    });
  };

  Sound.prototype = {
    play: function (callback) {
      SoundJS.play(this.name);
      callbacks[this.name] = callback;
    },
    loop: function () {
      SoundJS.play(this.name, SoundJS.INTERRUPT_NONE, 1, true);
    },
    stop: function () {
      SoundJS.stop(this.name);
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

  _.each(audioList, function (versions, name) {
    var group = new SoundGroup();
    _.each(versions, function (version) {
      var filename = name + '-' + version;
      group[version] = new Sound(filename);
    });
    Audio[name] = group;
  });

  Game.events.subscribe('pause', function () {
    SoundJS.setMute(true);
  }).subscribe('play', function () {
    SoundJS.setMute(false);
  }).subscribe('game over', function () {
    _.invoke(Audio, 'stopAll');
  });

  Progress.audioLoaded();

  // soundManager.ontimeout(function() {
  //   Console.log('Audio failed to initialize.');

  //   var fakeSound = {
  //     play: function (callback) {
  //       if (callback) {
  //         callback();
  //       }
  //     },
  //     loop: function () {},
  //     stop: function () {}
  //   };
  //   _.each(audioList, function (versions, name) {
  //     var group = new SoundGroup();
  //     _.each(versions, function (version) {
  //       group[version] = fakeSound;
  //     });
  //     Audio[name] = group;
  //   });

  //   Progress.audioLoaded();

  //   Game.events.fireEvent("audio loaded");
  // });

  return Audio;
});
