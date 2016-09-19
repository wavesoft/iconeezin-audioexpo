
var Iconeezin = require('iconeezin');

const effect_duration = 0.3; // seconds
const effect_scale = 0.5;

function rescheduleChirp(bird) {
  bird.state.chirp_in = Math.random() * 500 + 300;
}

function playChirp(bird) {
  bird.song.play();
}

/**
 * Bird song playback engine
 */
var BirdSongs = function() {
  this.birds = [];
  this.active = false;
};

BirdSongs.prototype = {
  constructor: BirdSongs,

  add: function(song, mesh) {
    var bird = {
      song: song,
      mesh: mesh,
      state: {
        chirp_in: 0,
        effect: 0
      }
    };
    rescheduleChirp(bird);
    this.birds.push(bird);
  },

  reset: function() {
    this.birds = [];
    this.active = false;
  },

  stop: function() {
    this.active = false;
  },

  playRandom: function(active) {
    if (!this.active) {
      // Reschedule chirps on activate, otherwise we are going
      // to hear all them together
      this.birds.forEach(function (bird) {
        rescheduleChirp(bird);
      });
    }
    this.active = true;
  },

  playSequence: function(interval) {
    this.active = false;
    var birds = this.birds.slice();

    var timer;
    var playFn = function() {
      var bird = birds.shift();
      if (!bird) {
        clearInterval(timer);
        return;
      }
      bird.song.play();
      bird.state.effect = 1.0;
    };

    var timer = setInterval(playFn, interval || 1000)
    playFn();
  },

  update: function(delta) {
    var active = this.active;
    this.birds.forEach(function (bird) {

      // Fade out effect
      if (bird.state.effect > 0) {
        bird.state.effect -= delta/1000 * 1/effect_duration;
        if (bird.state.effect <= 0) {
          bird.state.effect = 0;
        }
      }

      // Wait for chirp
      if (active && (bird.state.chirp_in -= delta) <= 0) {
        rescheduleChirp(bird);
        playChirp(bird);
        bird.state.effect = 1.0;
      }

      // Apply effect
      bird.mesh.scale.set(
          1 + bird.state.effect * effect_scale,
          1 + bird.state.effect * effect_scale,
          1 + bird.state.effect * effect_scale
        );

    });
  }

};

module.exports = BirdSongs;
