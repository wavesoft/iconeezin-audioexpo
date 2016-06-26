
var THREE = require('three');
var Iconeezin = require('iconeezin');

var CorridorLogic = require('./lib/CorridorLogic');

/**
 * Experiment logic
 */
var Experiment = function( db ) {
	Iconeezin.API.Experiment.call(this, db);

	// Camera enters from corridor entrance
	this.anchor.position.set( 0, 0, 3 );
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
Experiment.prototype.onShown = function() {

	var phrase_ok = [ "very good!", "excellent!", "perfect!", "great!" ];
	var phrase_err = [ "Unfortunately that's the wrong corridor.", "Oops, that's the wrong corridor!" ];

	// Start noise
	this.noise = this.database['simple/sounds/noise'].play( true );
	this.noise.setVolume( 0.1 );

	// Helper function to call on every iteration
	var experimentIteration = (function() {

		// Pick a random direction
		var correct_direction = 0;
		if (Math.random() > 0.5) correct_direction = 1;

		// Say direction
		var name = [ "left", "right" ][correct_direction];
		Iconeezin.Runtime.Interaction.say("Please turn "+name);

		// Track
		Iconeezin.Runtime.Tracking.startTask( 'corridor', (function( meta ){

			// Tell corridor logic to start running a new experiment
			//
			// when the user has selected a final corridor the callback
			// will be fired, with the appropriate direction.
			//
			this.corridors.runExperiment(

				// Start from opposite direction
				(correct_direction == 0) ? 1 : 0,

				// Handle user response
				function(dir) {
					// Process results
					if (dir == correct_direction) {
						Iconeezin.Runtime.Interaction.say( phrase_ok[Math.floor(Math.random()*phrase_ok.length)] );
						Iconeezin.Runtime.Tracking.trackEvent('corridor.choice', { 'corridor': 'left' })
					} else {
						Iconeezin.Runtime.Interaction.say( phrase_err[Math.floor(Math.random()*phrase_err.length)] );
						Iconeezin.Runtime.Tracking.trackEvent('corridor.choice', { 'corridor': 'right' })
					}

				},

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
