
var THREE = require('three');
var Iconeezin = require('iconeezin');

var CorridorLogic = require('./lib/CorridorLogic');

/**
 * Experiment logic
 */
var Experiment = function( db ) {
	Iconeezin.API.Experiment.call(this, db);

	// Camera enters from corridor entrance
	this.anchor.position.set( 0, 0, 2 );
	this.anchor.direction.set( 0, 1, 0 );

	// Get corridor model from database
	var geom = db['threshold/models/corridor'];

	// Replace materials with MeshNormal Material
	geom.traverse(function(obj) {
		if (obj instanceof THREE.Mesh) {
			obj.material = new THREE.MeshNormalMaterial();
		}
	});

	// Create corridor logic that repeats the corridor objects
	// and calculate the correct animation path for every experiment
	this.corridors = new CorridorLogic( geom )
	this.add( this.corridors );

};

/**
 * Subclass from Iconeezin.API.Experiment
 */
Experiment.prototype = Object.create( Iconeezin.API.Experiment.prototype );

/**
 * Start experiment when shown
 */
Experiment.prototype.onWillShow = function( callback ) {

	var phrase_ok = [ "very good!", "excellent!", "perfect!", "great!" ];
	var phrase_err = [ "Unfortunately that's the wrong corridor.", "Oops, that's the wrong corridor!" ];

	var choice_last_correct = false;
	var choice_correct = 0;
	var choice_wrong = 0;

	var noise_level = 0, last_noise_level = 0;
	var noise = this.database['threshold/sounds/noise'].play( true );
	var ambient = this.database['threshold/sounds/ambient'].play( true );

	noise.setVolume(0);
	ambient.setVolume(0.5);

	//
	// Introduction iteration that only plays introduction
	// and then starts the experimental loop.
	//
	var executeIntroduction = (function() {

		// Pick a random direction
		var random_direction = 0;
		if (Math.random() > 0.5) random_direction = 1;

		// Play intro
		this.database['threshold/sounds/introduction'].play();

		// Tell corridor logic to start running a new experiment
		//
		// this gives us some time for the user to hear the first introduction
		// when it's completed, it triggers the experiment iteration.
		//
		this.corridors.runExperiment(
			random_direction,
			null,
			executeNextTask
		);

	}).bind(this);

	//
	// Run an experiment 
	//
	var executeNextTask = (function() {

		// If for any reason the experiment was unloaded, exit
		if (!this.isActive) {
			return;
		}

		// Track
		Iconeezin.Runtime.Tracking.startNextTask( { }, (function( meta, progress ){
			console.debug("Experiment meta=",meta,", progress=",progress*100,"%");

			//
			// Helper function to loop iterations
			// in case of wrong user choices.
			//
			var runTask = (function() {

				// If for any reason the experiment was unloaded, exit
				if (!this.isActive) {
					return;
				}

				//
				// Execute experiment and if the choice is
				// wrong, re-run the same experiment
				//
				executeExperiment( meta, (function( is_correct ) {

					// If for any reason the experiment was unloaded, exit
					if (!this.isActive) {
						return;
					}

					if (!is_correct) {
						runTask();
					} else {

						// Mark completion of task
						Iconeezin.Runtime.Tracking.completeTask({
							'level': last_noise_level,
							'correct': is_correct
						});

						// Check if we are completed
						if (progress == 1.0) {
							// This experiment is completed
							Iconeezin.Runtime.Experiments.experimentCompleted();	
						} else {
							// Schedule a new iteration
							executeNextTask();
						}

					}
				}).bind(this) )

			}).bind(this);

			// First run
			runTask();

		}).bind(this) );

	}).bind(this);

	//
	// Experiment iteration that queries next task from tracking
	// metadata and loop until completed.
	//
	var executeExperiment = (function( meta, callback ) {

		// Local proeprties
		var noise_level = meta['level'];
		var announced = false;
		var is_correct = false;

		// Pick a random direction
		var correct_direction = 0;
		if (Math.random() > 0.5) correct_direction = 1;

		// Skip first announcement
		if (correct_direction == 0) {
			this.database['threshold/sounds/turn-left'].play().setVolume(0.9);
		} else if (correct_direction == 1) {
			this.database['threshold/sounds/turn-right'].play().setVolume(0.9);
		}

		// Tell corridor logic to start running a new experiment
		//
		// when the user has selected a final corridor the callback
		// will be fired, with the appropriate direction.
		//
		this.corridors.runExperiment(

			// Start from opposite direction
			(correct_direction == 0) ? 1 : 0,

			// Handle user response
			(function(dir) {

				// Process results
				if (dir == correct_direction) {
					this.database['threshold/sounds/choice-correct'].play();
					Iconeezin.Runtime.Tracking.trackEvent('corridor.choice', { 'corridor': 'left' })

					is_correct = true;
					choice_correct++;

				} else {
					this.database['threshold/sounds/choice-wrong'].play();
					Iconeezin.Runtime.Tracking.trackEvent('corridor.choice', { 'corridor': 'right' })

					is_correct = false;
					choice_wrong++;

				}

			}).bind(this),

			// Re-schedule at completion
			(function(dir) {

				// Complete task
				if (callback) callback( is_correct );

			}).bind(this),

			// Since noise is quite annoying we are fading the noise
			// a few seconds before the noise.
			(function(v) {

				// Increase the spread (position were the fader starts)
				// depending on the noise level. The louder, the earler
				// it should start fading
				var spread = 0.2 + (0.2 * noise_level);

				// Apply fader
				var fade = 0;
				if (v >= (1.0-spread)) {
					fade = (v-1.0+spread)/spread;
					noise.setVolume( noise_level * fade );
				} else if (v <= spread) {
					fade = (spread-v)/spread;
					noise.setVolume( noise_level * fade );
				}

				// Once when we pass the 20% of the passage
				// announce the noise we are going to find
				if (!announced && (v > 0.6)) {
					announced = true;

					// Announce depending on level
					if (noise_level < 0.2) {
						// Nothing here
					} else if (noise_level < 0.4) {
						this.database['threshold/sounds/noisy-a'].play();
					} else if (noise_level < 0.8) {
						this.database['threshold/sounds/noisy-b'].play();
					} else {
						this.database['threshold/sounds/noisy-c'].play();
					}
				}

			}).bind(this)

		);

	}).bind(this);

	// Start first iteration
	executeIntroduction();

	// Callback
	callback();

}

/**
 * Expose experiment entry point
 */
module.exports = Experiment;
