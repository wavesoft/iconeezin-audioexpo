
var THREE = require('three');
var Iconeezin = require('iconeezin');
var MonumentRoom = require('./lib/MonumentRoom');

/**
 * Experiment logic
 */
var Experiment = function( db ) {
	Iconeezin.API.Experiment.call(this, db);

	// Camera enters from corridor entrance
	this.anchor.position.set( 0, 1.2, 2 );
	this.anchor.direction.set( 0, 1, 0 );

	// The interchangable objects
	this.activeMonument = -1;
	this.monuments = [
		new MonumentRoom( db ),
		new MonumentRoom( db )
	];
	this.monuments[0].visible = false;
	this.monuments[1].visible = false;
	this.add(this.monuments[0]);
	this.add(this.monuments[1]);

	// // Create a sphere for equirectangular VR
	// var geom = new THREE.SphereGeometry( 500, 60, 40 );
	// geom.scale( -1, 1, 1 );

	// // Create material
	// this.material = new THREE.MeshBasicMaterial();

	// // Create the sphere mesh
	// var mesh = new THREE.Mesh( geom, this.material );
	// mesh.rotation.x = Math.PI/2;
	// this.add( mesh );

};

/**
 * Subclass from Iconeezin.API.Experiment
 */
Experiment.prototype = Object.create( Iconeezin.API.Experiment.prototype );

/**
 * Set the texture
 */
Experiment.prototype.switchTexture = function( image, cb ) {
	var scope = this;
	Iconeezin.Runtime.Video.fadeOut(function() {
		scope.material.map = scope.database['delay/pano/'+image];
		Iconeezin.Runtime.Video.fadeIn(cb);
	});
}

/**
 * Start experiment when shown
 */
Experiment.prototype.boo = function( ) {

	Iconeezin.Runtime.Controls.followPath( 
		this.monument.pathLeave, {
			'speed': 2
		}
	);

}

/**
 * Start experiment when shown
 */
Experiment.prototype.executeRun = function( scale, lines, callback ) {

	// Pick a monument and the last one to use as reference
	var mid = (this.activeMonument == 0) ? 1 : 0, lid = 1-mid,
		m_new = this.monuments[mid], m_last = this.monuments[lid];

	// Prepare monument
	m_new.visible = true;
	m_new.rebuild( scale );
	m_new.setPodiumMessage( lines );

	// Calculate position
	m_new.position.set( 0, m_last.position.y + m_last.length, 0 );

	// Prepare walk-in & walk-out functions
	var walk_in = function( cb ) {
		Iconeezin.Runtime.Controls.followPath( 
			m_new.pathEnter, {
				'speed': 1.0,
				'matrix': m_new.matrix.clone(),
				'callback': function(v) {
					if ((v == 1) && cb) cb();
				}
			}
		);
	};
	var walk_out = function( cb ) {
		Iconeezin.Runtime.Controls.followPath( 
			m_last.pathLeave, {
				'speed': 2.0,
				'matrix': m_last.matrix.clone(),
				'callback': function(v) {
					if ((v == 1) && cb) cb();
				}
			}
		);
	};

	// If we had a previous item, walk out of it first
	if (this.activeMonument != -1) {
		walk_out(function() {
			walk_in(callback);
		});
	} else {
		walk_in(callback);
	}

	// Keep the active monument ID
	this.activeMonument = mid;

}

/**
 * Cleanup when hiding
 */
Experiment.prototype.onWillHide = function( callback ) {
	// Iconeezin.Runtime.Audio.voiceEffects.setEnabled(false);
	callback();
}

/**
 * Start experiment when shown
 */
Experiment.prototype.onWillShow = function( callback ) {

	// Reset
	this.monuments[0].visible = false;
	this.monuments[1].visible = false;
	this.monuments[0].length = 0;
	this.monuments[1].length = 0;

	// Iconeezin.Runtime.Audio.voiceEffects.setEnabled(true);

	// Prepare next task function
	var executeNextTask = (function() {

		// Query runtime tracking for next task metadata
		Iconeezin.Runtime.Tracking.startNextTask( { }, (function( meta, progress ){

			// Start run
			this.executeRun( meta['scale'], meta['message'], (function() {

				// Enable voice delay at specified values
				Iconeezin.Runtime.Audio.voiceEffects.setDelay( meta['delay'] );

				// Continue helper
				var completeTask = (function() {

					// Mark completion of task
					Iconeezin.Runtime.Tracking.completeTask({
					});

					// Check if we are completed
					if (progress == 1.0) {
						// This experiment is completed
						Iconeezin.Runtime.Experiments.experimentCompleted();	
					} else {
						// Schedule a new iteration
						executeNextTask();
					}

				}).bind(this);

				// Retry function
				var tryDictation = (function() {

					// Reset progress
					this.monuments[this.activeMonument].setPodiumMessageProgress( 0 );

					// Compile the message to expect
					var message = meta['message'].join(" ");
					message = message.replace(/[.,;:?]/g, "").trim();
					console.log("Text: '"+message+"'");

					Iconeezin.Runtime.Audio.voiceCommands.setLanguage( meta['lang'] );
					Iconeezin.Runtime.Audio.voiceCommands.expectPhrase( message, (function(meta) {

						// Update progress in the podium
						this.monuments[this.activeMonument].setPodiumMessageProgress( meta['progress'] );

						// Check if completed
						if (meta['completed']) {
							if (meta['score'] < 0.8) {
								Iconeezin.Runtime.Video.glitch(250);
								setTimeout(tryDictation, 500);
							} else {
								completeTask();
							}
						}

					}).bind(this));

				}).bind(this);

				// First dictation attempt
				tryDictation();

			}).bind(this) )

		}).bind(this));

	}).bind(this);

	/*
	// Set initial texture
	var id = 0, v = 0;
	Iconeezin.Runtime.setInterval((function() {

		// Calculate an item but not being like the last one
		var a = [ 'garden', 'reingauer', 'winter', 'sunset', 'desert' ], n = id;
		while (id == n) {
			n = Math.floor(a.length * Math.random());
		}
		id = n;

		// Apply
		this.switchTexture( a[id], function() {

			// Update progress
			v += 0.1;
			Iconeezin.Runtime.Video.showProgress( v, "Updated to "+v );

		});


	}).bind(this), 5000);

	// Set default texture
	this.material.map = this.database['delay/pano/garden'];
	*/

	// Callback when ready
	callback();

	// And start first task
	executeNextTask();

}

/**
 * Expose experiment entry point
 */
module.exports = Experiment;
