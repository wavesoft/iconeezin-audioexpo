
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
	var geom = db['simple/models/corridor'];

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
	var is_loaded = false;
	var first_corridor = true;

	var choice_last_correct = false;
	var choice_correct = 0;
	var choice_wrong = 0;

	var noise_level = 0;
	var noise = this.database['simple/sounds/noise'].play( true );
	noise.setVolume(0);

	// Play intro
	this.database['simple/sounds/introduction'].play();

	// Helper function to call on every iteration
	var experimentIteration = (function() {

		// Pick a random direction
		var correct_direction = 0;
		if (Math.random() > 0.5) correct_direction = 1;

		// Skip first announcement
		if (!first_corridor) {
			if (correct_direction == 0) {
				this.database['simple/sounds/turn-left'].play();
			} else if (correct_direction == 1) {
				this.database['simple/sounds/turn-right'].play();
			}
		}

		// Track
		Iconeezin.Runtime.Tracking.startTask( 'corridor', {
			'correct' 		: choice_correct,
			'wrong' 		: choice_wrong,
			'last_correct' 	: choice_last_correct
		}, (function( meta ){

			// Trigger callback once we have the first corridor
			if (!is_loaded) {
				is_loaded = true;
				callback();
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

					// Skip first run
					if (first_corridor) {
						first_corridor = false;
						return;
					}

					// Process results
					if (dir == correct_direction) {
						this.database['simple/sounds/choice-correct'].play();
						Iconeezin.Runtime.Tracking.trackEvent('corridor.choice', { 'corridor': 'left' })

						choice_last_correct = true;
						choice_correct++;

						// Increatse noise level
						noise_level += 0.1;
						if (noise_level > 1) noise_level = 1;
						noise.setVolume( noise_level );

					} else {
						this.database['simple/sounds/choice-wrong'].play();
						Iconeezin.Runtime.Tracking.trackEvent('corridor.choice', { 'corridor': 'right' })

						choice_wrong++;

					}

				}).bind(this),

				// Re-schedule at completion
				function(dir) {

					// Mark completion of task
					Iconeezin.Runtime.Tracking.completeTask();

					// Schedule a new iteration
					experimentIteration();

				}
			);

		}).bind(this));


	}).bind(this);

	// Start first iteration
	experimentIteration();

}

/**
 * Expose experiment entry point
 */
module.exports = Experiment;
