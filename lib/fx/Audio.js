define(['Game', 'Console', 'fx/audio-list', 'Progress'], function (Game, Console, audioList, Progress) {

  // SoundJS does not support iPad or iPhone
  // wish I didn't have to snoop user agents...
  var supported = !(navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i));

  var masterVolume = 0.5;

  var enabled = true;
  var paused  = false;

  // mp3s aren't working on chrome anymore
  var suffix = '.wav';

  var channelCount = 2;

  // SoundJS.setMasterVolume(masterVolume);

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
    var src = "assets/audio/" + filename + suffix;

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
    playRandom: function (callback) {
      var sounds = _.values(this);
      var selection = Math.floor(Math.random() * sounds.length);
      sounds[selection].play(callback);
    }
  };


  // fake out sound interface if not supported
  if (!supported) {

    Sound = function () {};

    SoundGroup.prototype = {
      stopAll: function () {},
      playRandom: function (callback) {
        if (callback) {
          callback();
        }
      }
    };

    Sound.prototype = {
      play: function (callback) {
        if (callback) {
          callback();
        }
      },
      loop: function () {},
      stop: function () {}
    };
  }

  var Audio = {};

  // load the audio
  _.each(audioList, function (versions, name) {
    var group = new SoundGroup();
    _.each(versions, function (version) {
      var filename = name + '-' + version;
      group[version] = new Sound(filename);
    });
    Audio[name] = group;
  });

  // fade out in 2 seconds
  var fadeOutMasterVolume = function () {
    var volume = masterVolume;
    var interval = window.setInterval(function () {
      volume -= 0.05;
      SoundJS.setMasterVolume(volume);
      if (volume <= 0) {
        window.clearInterval(interval);
        SoundJS.setMute(true);
        SoundJS.setMasterVolume(masterVolume);
        _.invoke(Audio, 'stopAll');
      }
    }, 200);
  };

  Game.events.subscribe('pause', function () {
    paused = true;
    SoundJS.setMute(true);
  }).subscribe('play', function () {
    paused = false;
    SoundJS.setMute(!enabled);
  }).subscribe('game over', function () {
    fadeOutMasterVolume();
  }).subscribe('continue game,game start', function () {
    SoundJS.setMute(!enabled);
  }).subscribe('toggle sound', function () {
    enabled = !enabled;
    SoundJS.setMute(!enabled || paused);
    Game.events.fireEvent('audio state changed', enabled);
  });

  Progress.audioLoaded();

  return Audio;
});
