
var THREE = require('three');
var Iconeezin = require('iconeezin');
var InfiniteGround = require('./lib/InfiniteGround');
var Objects = require('./lib/Objects');
var BirdPath = require('./lib/BirdPath');
var BirdSong = require('./lib/BirdSongs');
var HUD = require('./lib/HUD');

const ANSWER = {
  CORRECT: 0,
  MASKED: 1,
  WRONG: 2
}

/**
 * Experiment logic
 */
var Experiment = function( db ) {
	Iconeezin.API.Experiment.call(this, db);
  this.objects = new Objects(db);

	// Camera enters from corridor entrance
	this.anchor.position.set( 0, 0, 0 );
	this.anchor.direction.set( 0, 1, 0 );

};

/**
 * Subclass from Iconeezin.API.Experiment
 */
Experiment.prototype = Object.create( Iconeezin.API.Experiment.prototype );

/**
 * Initialize experiment when it is loaded
 */
Experiment.prototype.onLoad = function(db) {

  // Create infinite ground at constructor
  this.infiniteGround = new InfiniteGround({objects: this.objects, db: db})

  this.add(this.infiniteGround);
  this.infiniteGround.position.set(0, 0, -2);

  this.direction = new THREE.Vector3(0, 0, 0);

  this.fog = new THREE.FogExp2(0xbcc9d0, 0.02);

  var keyLight = new THREE.DirectionalLight( 0x999999, 1 );
  keyLight.position.set( 1, 1, -1 );
  this.add(keyLight);

  this.birds = [];
  this.birdPaths = [];
  this.birdSong = new BirdSong();

}

/**
 * Initialize experiment when it became visible
 */
Experiment.prototype.onShown = function() {

  var hud = new HUD( this.database['masking/icons/vu'] );
  Iconeezin.Runtime.Video.addHudLayer(hud);
  Iconeezin.Runtime.Controls.infiniteNavigationUsing( this );

  var runNextTask = (function() {

    // Load next task from tracking
    Iconeezin.Runtime.Tracking.startNextTask( { }, (function( meta, progress ){

      // Show frequency difference
      hud.setDifference( meta.diff );

      // Run sequence
      console.log('--Meta: ', meta);
      this.runSequence(meta, (function (isCorrect) {
        console.log('--Completed: ', isCorrect);

        // Re-schedule or complete
        if (progress === 1) {
          Iconeezin.Runtime.Experiments.experimentCompleted();
        } else {
          runNextTask();
        }

      }).bind(this));

    }).bind(this));

  }).bind(this);

  // Play introduction
  this.database['masking/sounds/introduction'].play();
  Iconeezin.Runtime.setTimeout(runNextTask, 16000);

  // Ground blacking fix
  this.infiniteGround.groundMap.needsUpdate = true;
  this.infiniteGround.groundNormalMap.needsUpdate = true;

}

/**
 * Update infinite sea animation
 */
Experiment.prototype.onUpdate = function( delta ) {
  if (!this.infiniteGround) return;

  // Update ground
  this.infiniteGround.update( delta, this.direction );

  // Update clocks of bird songs and paths
  this.birdSong.update( delta );
  this.birdPaths.forEach((function (bird) {
    bird.update( delta );
  }).bind(this));

}

Experiment.prototype.onOrientationChange = function( quaternion ) {

  // Calculate the direction vector that will be used by the
  // infinite sea to calculate the direction
  this.direction.set(0, 0, -1);
  this.direction.applyQuaternion(quaternion);

}

/**
 * Wait till user reaches an empty space
 */
Experiment.prototype.waitOutpost = function( callback ) {
  Iconeezin.Runtime.setTimeout(callback, Math.random()*3000 + 7000);
}

/**
 * Run an experimental sequence
 */
Experiment.prototype.runSequence = function(config, callback) {
  var db = this.database;
  var userChoice = 0;

  // Add as many birds as song objects
  this.removeBirds();
  this.addBirds(config.sounds.length);

  // Create bird songs
  this.birdSong.reset();
  config.sounds.forEach((function(song, i) {
    this.birdSong.add( db['masking/'+song.src], this.birds[i] );
  }).bind(this));

  // Start random chirping
  this.birdSong.playRandom();

  Iconeezin.Util.createSequence()

    //////////////////////////////////////////
    // Play for the user to reach an outpost
    //////////////////////////////////////////
    .waitFor((function(callback) {
      this.waitOutpost(callback);
    }).bind(this))

    //////////////////////////////////////////
    // Stop sounds
    //////////////////////////////////////////
    .do((function() {

      // Stop all bird songs in order to state the question
      this.birdSong.stop();

    }).bind(this))
    .playAudio( db['masking/sounds/ask/how-many'] )

    //////////////////////////////////////////
    // Wait for user input
    //////////////////////////////////////////
    .waitFor((function(callback) {

      // Wait for user input
      this.getUserInput((function(numSaid) {
        userChoice = numSaid;
        callback();
      }).bind(this));

    }).bind(this))

    //////////////////////////////////////////
    // Bring birds into view
    //////////////////////////////////////////
    .do((function() {

      // Brind the birds close to the user
      this.birdSong.playRandom();
      this.birdPaths.forEach(function(path) {
        path.enter();
      });

    }).bind(this))
    .sleep(4000)

    //////////////////////////////////////////
    // Play correct answer
    //////////////////////////////////////////
    .select((function(sequencer) {
      var numMasked = config.masked;
      var numCorrect = config.sounds.length;

      // Stop bird song
      this.birdSong.stop();

      // Use a child sequencer to play the correct sound
      if (numSaid === numCorrect) {
        console.debug('- Correct');
        sequencer.playAudio( db['masking/sounds/ack/correct'] );
        result = ANSWER.CORRECT;

      // Check for masked answer
      } else if (numSaid === numMasked) {
        console.debug('- Mask-' + numCorrect);
        sequencer.playAudio( db['masking/sounds/ack/mask/' + numCorrect] );
        result = ANSWER.MASKED;

      // That's a wrong answer
      } else {
        console.debug('- Wrong-' + numCorrect);
        sequencer.playAudio( db['masking/sounds/ack/wrong/' + numCorrect] );
        result = ANSWER.WRONG;

      }

    }).bind(this))
    .waitFor((function(callback) {

      // Play birds in sequence
      console.debug('- Play sequence');
      this.birdSong.playSequence(callback);

    }).bind(this))

    //////////////////////////////////////////
    // Fly birds away
    //////////////////////////////////////////
    .do((function() {

      // Birds take their leave
      this.birdPaths.forEach(function(path) {
        path.leave();
      });

    }).bind(this))
    .sleep(4000)

    //////////////////////////////////////////
    // Reset birds and callback
    //////////////////////////////////////////
    .do((function() {

      // Remove birds
      this.removeBirds();

      // Trigger callback
      if (callback) callback(result);

    }).bind(this))

    ///////////////////////////////////////
    .start();

}

/**
 * Remove all birds from scene
 */
Experiment.prototype.removeBirds = function() {

  // Remove birds
  this.birds.forEach((function(bird) {
    this.remove(bird);
  }).bind(this));

  // Remove bird paths
  this.birdPaths = [];

}

/**
 * Add birds and return an array of their instances
 */
Experiment.prototype.addBirds = function(count) {
  var spacing = (Math.PI/2) / count;
  var arc = Math.PI/4;
  var birds = [];

  for (var i=0; i<count; i++) {
    var bird = this.objects.createSparrow();
    bird.visible = false;

    this.add(bird);
    this.birds.push(bird);
    this.birdPaths.push( new BirdPath(bird, arc) );

    arc += spacing;
  }

  return this.birds;
}

/**
 * Wait for correct user input
 */
Experiment.prototype.getUserInput = function(callback) {
  var db = this.database;
  console.log('Waiting for use rinput');

  var applyCallback = function(number) {
    callback(number);
  }

  var waitInput = function() {

    // Run voice command recognition
    Iconeezin.Runtime.Audio.voiceCommands.setLanguage( 'el-GR' );
    Iconeezin.Runtime.Audio.voiceCommands.expectCommands({

      '(^|\s)[εέ]ναν?(\s|$)|^1$': applyCallback.bind(this, 1),
      '(^|\s)δ[υύ]ο(\s|$)|^2$': applyCallback.bind(this, 2),
      '(^|\s)τρε[ιί]ς(\s|$)|(^|\s)τρ[ιί]α(\s|$)|^3$|greece': applyCallback.bind(this, 3),
      '(^|\s)τ[εέ]σσερεις(\s|$)|(^|\s)τ[εέ]σσερα(\s|$)|^4$': applyCallback.bind(this, 4),
      '(^|\s)π[εέ]ντε(\s|$)|^5$': applyCallback.bind(this, 5)

    }, function(error, lastTranscript) {
      Iconeezin.Runtime.Video.glitch(250);
      if (error != null) {
        // Engine error
        db['masking/sounds/reco/error'].play();
        Iconeezin.Runtime.setTimeout(waitInput, 2500);
      } else {
        // No command matched
        db['masking/sounds/reco/invalid'].play();
        Iconeezin.Runtime.setTimeout(waitInput, 4500);
      }
    }, 'Πείτε έναν αριθμό');

  };

  // Wait for uer input
  waitInput();
}

/**
 * Expose experiment entry point
 */
module.exports = Experiment;
