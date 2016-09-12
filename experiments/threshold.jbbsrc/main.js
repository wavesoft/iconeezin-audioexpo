
var THREE = require('three');
var Iconeezin = require('iconeezin');

var CorridorLogic = require('./lib/CorridorLogic');
var HUD = require('./lib/HUD');

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

	// Load maps
	var facade_map = Iconeezin.Util.createTexture(db['threshold/textures/facade/diffuse']);
	var facade_normal = Iconeezin.Util.createTexture(db['threshold/textures/facade/normal']);
	var facade_ao = Iconeezin.Util.createTexture(db['threshold/textures/facade/ao']);
	var street_map = Iconeezin.Util.createTexture(db['threshold/textures/street/diffuse']);
	var street_normal = Iconeezin.Util.createTexture(db['threshold/textures/street/normal']);
	var street_ao = Iconeezin.Util.createTexture(db['threshold/textures/street/ao']);

	// Replace materials with MeshNormal Material
	geom.traverse(function(obj) {
		if (obj instanceof THREE.Mesh) {
			switch (obj.name) {
				case 'floor':
					console.log(obj);
					var uvs = obj.geometry.attributes.uv.array;
					obj.geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
					obj.receiveShadow = true;
					obj.material = new THREE.MeshStandardMaterial({
						map: street_map,
						aoMap: street_ao,
						normalMap: street_normal,
						roughness: 1.0,
						metalness: 0,
					});
					break;

				case 'facade':
					var uvs = obj.geometry.attributes.uv.array;
					obj.geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
					obj.castShadow = true;
					obj.receiveShadow = true;
					obj.material = new THREE.MeshStandardMaterial({
						color: 0xffffff,
						map: facade_map,
						aoMap: facade_ao,
						normalMap: facade_normal,
						roughness: 1.0,
						metalness: 0,
					});
					break;

				default:
					obj.material = new THREE.MeshStandardMaterial({
						color: 0xffffff
					});
					break;

			}
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

	var hud = new HUD( this.database['threshold/icons/sound'] );
	Iconeezin.Runtime.Video.addHudLayer(hud);

	var state = {

		auto_direction: (Math.random() > 0.5) ? 1 : 0,
		correct_direction: 0,
		chosen_direction: 0,

		accept_task: true,
		complete_experiment: false,

		has_introduced: false,
		has_announced: false,
		active_meta: null,

	};

	var position = {

		// Were we are announcing assisting information before the noise
		announce: 0.6,

		// Noise starts 20% before finishing the experiment and it
		// drops out 20% after the distance.
		noise: 0.2,
		noise_spread: 0.2

	};

	//
	// Apply the given information to the noise
	//
	var do_noise_fader =(function(level) {
		var level = state.active_meta.level * level;
		if (level < 0.01) level = 0.0;
		if (level > 0.99) level = 1.0;
		console.log('>> Fade noise at', level);

		// // Disable effect when not visible, for performance improvements
		// if (!level) {
		// 	Iconeezin.Runtime.Video.viewport.setEffect(0);
		// } else {
		// 	Iconeezin.Runtime.Video.viewport.setEffect(3, level);
		// }

		noise.setVolume(level);
		hud.setNoise(level);

	}).bind(this);

	//
	//
	//
	var do_narrate_direction = (function() {
		var correct = state.correct_direction;
		console.log('>> Announcing to turn', correct);
    if (correct == 0) {
      this.database['threshold/sounds/turn-left'].play().setVolume(0.9);
    } else if (correct == 1) {
      this.database['threshold/sounds/turn-right'].play().setVolume(0.9);
    }
	}).bind(this);

	//
	//
	//
	var do_narrate_confirmation = (function() {
		var chosen = state.chosen_direction;
		var correct = state.correct_direction;
		console.log('>> Announcing if', chosen, '==', correct);
		if (chosen === correct) {
      this.database['threshold/sounds/choice-correct'].play();
      Iconeezin.Runtime.Tracking.trackEvent('corridor.choice', { 'corridor': 'left' })
		} else {
      this.database['threshold/sounds/choice-wrong'].play();
      Iconeezin.Runtime.Tracking.trackEvent('corridor.choice', { 'corridor': 'right' })
		}
	}).bind(this);

	//
	//
	//
	var do_narrate_noisewarning = (function() {
		var level = state.active_meta.level;
		console.log('>> Announce noise level of', level);
    if (level < 0.2) {
      // Nothing here
    } else if (level < 0.4) {
      this.database['threshold/sounds/noisy-a'].play();
    } else if (level < 0.8) {
      this.database['threshold/sounds/noisy-b'].play();
    } else {
      this.database['threshold/sounds/noisy-c'].play();
    }
	}).bind(this);

	//
	//
	//
	var do_introduction = (function() {
    this.database['threshold/sounds/introduction'].play();
	}).bind(this);

	//
	//
	//
	var do_introduction_final = (function() {
		console.log('>> Final introduction message');
	}).bind(this);

	//
	// Start an infinite loop through the corridor
	//
	var corridorPass = (function() {

		//
		// This function is called when the user enters a corridor.
		// When the experiment is running, this is the peak of the noise audio
		//

		// Check for introduction
		if (!state.has_introduced) {
			do_introduction();
		}
		// Check for narration of existing experiment
		else if (state.active_meta) {
			do_narrate_direction();
		}

		//
		// Tell corridor logic to start running a new experiment
		//
		// when the user has selected a final corridor the callback
		// will be fired, with the appropriate direction.
		//
		this.corridors.runExperiment(

			// [1] Direction
			state.auto_direction,

			// [2] User choice
			(function(dir) {

				// Keep user choice
				state.chosen_direction = dir;
				state.accept_task = (dir === state.correct_direction);

				// If we are narrating the introduction, complete it
				if (!state.has_introduced) {
					do_introduction_final();
					state.has_introduced = true;
					state.accept_task = true;
				} else {
					do_narrate_confirmation();
				}

				// If the experiment so far is successful, load the next task
				// otherwise operate with the tasks already known.
				if (state.accept_task) {

					// If the last task was at 100% progress, complete experiment
					if (state.complete_experiment) {
						console.log('>> Completing task');
						Iconeezin.Runtime.Experiments.experimentCompleted();
						return;
					}

					// Get new experiment metadata
					console.log('>> Loading new task');
					Iconeezin.Runtime.Tracking.startNextTask({}, (function(meta, progress) {

						// Keep experiment metadata
						state.active_meta = meta;
						state.complete_experiment = (progress === 1);

						// Fade-in the appropriate number of people in the corridor
						this.corridors.showCrowd( state.active_meta.crowd || 0, dir );

					}).bind(this));

				} else {

					// Fade-in the appropriate number of people in the corridor
					this.corridors.showCrowd( state.active_meta.crowd || 0, dir );

				}


			}).bind(this),

			// [3] Completion
			(function(dir) {

				// Pick a new correct and it's invert auto direction
				state.correct_direction = (Math.random() > 0.5) ? 1 : 0;
				state.auto_direction = state.correct_direction ? 0 : 1;

				// Reset flags
				state.has_announced = false;

				// No new experiment? Repeat the current experiment
				setTimeout(corridorPass, 1);

			}).bind(this),

			// [4] Update callback
			(function(v) {

				// If we don't have an experiment metadata or if we are still
				// in the introduction, don't render any noise
				if (!state.active_meta || !state.has_introduced) {
					return;
				}

				// Check for narration position
				if ((v >= position.announce) && !state.has_announced) {
					state.has_announced = true;
					do_narrate_noisewarning();
				}

				// Increase the spread (position were the fader starts)
				// depending on the noise level. The louder, the earler
				// it should start fading
				var spread = position.noise + (position.noise_spread * state.active_meta.level);

				// Apply noise fader
				var fade = 0;
				if (v >= (1.0-spread)) {
					fade = (v-1.0+spread)/spread;
					do_noise_fader( fade );
				} else if (v <= spread) {
					fade = (spread-v)/spread;
					do_noise_fader( fade );
				}

			}).bind(this)

		);

	}).bind(this);

	// Start first iteration
	corridorPass();

	// Callback
	callback();

}

/**
 * Expose experiment entry point
 */
module.exports = Experiment;
