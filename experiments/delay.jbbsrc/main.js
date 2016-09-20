
var THREE = require('three');
var Iconeezin = require('iconeezin');
var MonumentRoom = require('./lib/MonumentRoom');
var HUD = require('./lib/HUD');
var Materials = require('./lib/Materials');

/**
 * Experiment logic
 */
var Experiment = function( db ) {
	Iconeezin.API.Experiment.call(this, db);

	// Camera enters from corridor entrance
	this.anchor.position.set( 0, 1.2, 2 );
	this.anchor.direction.set( 0, 1, 0 );

	this.activeRecording = null;
	this.materials = new Materials(db);

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
Experiment.prototype.setupAndEnter = function( scale, lines, callback ) {

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
	var walk_in = (function( cb ) {
		// Follow entering path
		Iconeezin.Runtime.Controls.followPath(
			m_new.pathEnter, {
				'speed': 1.0,
				'matrix': m_new.matrix.clone(),
				'callback': (function(v) {
					if ((v == 1) && cb) {
						this.sndFootsteps.stop();
						cb();
					}
				}).bind(this)
			}
		);
	}).bind(this);
	var walk_out = (function( cb ) {
		// Start footsteps audio
		this.sndDoor.play();
		// First open doors
		m_last.openDoor((function() {
			// Then follow leaving path
			Iconeezin.Runtime.Controls.followPath(
				m_last.pathLeave, {
					'speed': 2.0,
					'matrix': m_last.matrix.clone(),
					'callback': function(v) {
						if ((v == 1) && cb) cb();
					}
				}
			);
		}).bind(this));
	}).bind(this);

	// If we had a previous item, walk out of it first
	this.sndFootsteps.play();
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
 * Initialize
 */
Experiment.prototype.onLoad = function( db ) {

	// The interchangable objects
	this.activeMonument = -1;
	this.monuments = [
		new MonumentRoom( db, this.materials ),
		new MonumentRoom( db, this.materials )
	];
	this.monuments[0].visible = false;
	this.monuments[1].visible = false;
	this.add(this.monuments[0]);
	this.add(this.monuments[1]);

	this.sndFootsteps = db['delay/sounds/footsteps'];
	this.sndDoor = db['delay/sounds/door'];

	// Add a key light
  var keyLight = new THREE.DirectionalLight( 0x999999, 1 );
  keyLight.position.set( 1, -1, -1 );
  this.add(keyLight);

  // Add HUD
  this.hud = new HUD(db['delay/textures/icon']);
	Iconeezin.Runtime.Video.addHudLayer(this.hud);

}

/**
 * Cleanup when hiding
 */
Experiment.prototype.onWillHide = function( callback ) {
	Iconeezin.Runtime.Audio.voiceEffects.setEnabled(false);
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

	this.database['delay/sounds/ambient'].play(true);

	Iconeezin.Runtime.Audio.voiceEffects.setEnabled(true);

	var experimentalRun = (function( meta, progress ) {

			// Enable voice delay at specified values
			console.log('--deay=', meta['delay']);
			this.hud.setDelay( meta['delay'] );
			Iconeezin.Runtime.Audio.voiceEffects.setDelay( meta['delay'] );

			// Start recording
			this.activeRecording = Iconeezin.Runtime.Audio.voiceEffects.record();

			// Continue helper
			var completeTask = (function(meta) {
				var meta = meta || {};

				// Collect recording
				if (this.activeRecording) {
					meta['_recording'] = this.activeRecording.stop();
				}

				// Mark completion of task
				Iconeezin.Runtime.Tracking.completeTask(meta);

				// Check if we are completed
				if (progress == 1.0) {
					// This experiment is completed
					Iconeezin.Runtime.Experiments.experimentCompleted();
				} else {
					// Schedule a new iteration
					executeNextTask();
				}

			}).bind(this);

			window.spoken = completeTask;

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
							setTimeout(tryDictation, 250);
						} else {
							completeTask({
								confidence: meta['confidence'],
								progress: meta['progress'],
								score: meta['score'],
								transcript: meta['transcript']
							});
						}
					}

				}).bind(this));

			}).bind(this);

			// First dictation attempt
			tryDictation();

	}).bind(this);

	// Prepare next task function
	var firstRun = true;
	var executeNextTask = (function() {

		// Query runtime tracking for next task metadata
		Iconeezin.Runtime.Tracking.startNextTask( { }, (function( meta, progress ){

			// Start run
			this.setupAndEnter( meta['scale'], meta['message'], (function() {
				if (firstRun) {

					// Trigger callback when ready
					callback();

					// Play introduction
					firstRun = false;
					this.database['delay/sounds/introduction'].play(false, function() {
						experimentalRun(meta, progress);
					});

				} else {
					experimentalRun(meta, progress);

				}
			}).bind(this) )

		}).bind(this));

	}).bind(this);

	// Initial task
	executeNextTask();

}

/**
 * Expose experiment entry point
 */
module.exports = Experiment;
