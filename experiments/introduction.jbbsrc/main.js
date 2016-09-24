
var THREE = require('three');
var Iconeezin = require('iconeezin');
var Materials = require('./lib/Materials');
var Objects = require('./lib/Objects');

/**
 * Experiment logic
 */
var Experiment = function( db ) {
	Iconeezin.API.Experiment.call(this, db);

	// Camera enters in the center, looking away from the door
	this.anchor.position.set( 1, -1, 2 );
	this.anchor.direction.set( 0, 1, 0 );

	this.interactionConfirmCallback = null;

};

/**
 * Subclass from Iconeezin.API.Experiment
 */
Experiment.prototype = Object.create( Iconeezin.API.Experiment.prototype );

/**
 * Initialize experiment on load
 */
Experiment.prototype.onLoad = function(db) {

	var materials = new Materials(db);
	var objects = new Objects(db);

	// Get lobby model from database
	var lobby = db['introduction/models/lobby'];

	// Apply materials
	lobby.traverse(function(obj) {
		switch (obj.name) {
			case 'grass':
				var uvs = obj.geometry.attributes.uv.array;
				obj.geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
				obj.material = materials.grass;
				break;

			case 'roof':
				var uvs = obj.geometry.attributes.uv.array;
				obj.geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
				obj.material = materials.roof;
				break;

			case 'faces':
			case 'passage':
				obj.material = materials.concrete;
				break;

			case 'pillars':
				var uvs = obj.geometry.attributes.uv.array;
				obj.geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
				obj.material = materials.concrete_pillars;
				break;

			case 'walls':
				var uvs = obj.geometry.attributes.uv.array;
				obj.geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
				obj.material = materials.concrete_walls;
				break;

			case 'floor':
				var uvs = obj.geometry.attributes.uv.array;
				obj.geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
				obj.material = materials.wood;
				break;

			default:
				obj.material = new THREE.MeshNormalMaterial();
				console.log(obj.name);
		}
	});
	this.add( lobby );

	var tree1 = objects.createTree01();
	tree1.position.set(-8.9, 8.4, 0);
	this.add(tree1);

	var tree2 = objects.createTree01();
	tree2.position.set(-5.2, 6.6, 0);
	this.add(tree2);

	var tree3 = objects.createTree01();
	tree3.position.set(-7.9, 4.8, 0);
	this.add(tree3);

  var keyLight = new THREE.DirectionalLight( 0x999999, 0.8 );
  keyLight.position.set( 1, 1, -1 );
  this.add(keyLight);

  var posters = [
  	[2.5, 1, Math.PI/2, 'posters/1'],
  	[2.5, 6.5, Math.PI/2, 'posters/2'],
  	[2.5, 12, Math.PI/2, 'posters/10'],

  	[-1.6, 16.5, Math.PI, 'posters/3'],
  	[-7.1, 16.5, Math.PI, 'posters/9'],
  	[-12.7, 16.5, Math.PI, 'posters/5'],

  	[-16.8, 12, -Math.PI/2, 'posters/8'],
  	[-16.8, 6.5, -Math.PI/2, 'posters/3'],
  	[-16.8, 1, -Math.PI/2, 'posters/7'],

  	[-12.7, -2.8, 0, 'posters/2'],
  	[-7.1, -2.8, 0, 'posters/4'],
  	[-1.6, -2.8, 0, 'posters/6'],
  ];

  posters.forEach((function (poster) {
	  var obj = objects.createPoster( db['introduction/' + poster[3]] );
	  obj.position.set(poster[0], poster[1], 1.5);
	  obj.rotation.set(0, 0, poster[2])
	  poster.push(obj);
	  this.add(obj);
  }).bind(this));

	// Make it interactive
	this.interactivePoster = posters[8][4];
	Iconeezin.Runtime.Interaction.makeInteractive( this.interactivePoster, {
		gaze: true,
		enabled: false,
		title: "Κοιτάξτε εδώ",
		onInteract: (function() {

			// Callback to the interaction confirmation function
			if (this.interactionConfirmCallback) {
				this.interactionConfirmCallback();
			}

		}).bind(this)
	});

	this.firstPath = new THREE.CubicBezierCurve3(
			new THREE.Vector3(   1.0000, -1.0000, 0 ),
			new THREE.Vector3(   1.0000,  1.7000, 0 ),
			new THREE.Vector3(  -3.5500,  1.7500, 0 ),
			new THREE.Vector3( -15.5000,  0.7700, 0 )
		);

	this.secondPath = new THREE.CubicBezierCurve3(
			new THREE.Vector3( -15.5000,  0.7700, 0 ),
			new THREE.Vector3( -18.4000, -0.2500, 0 ),
			new THREE.Vector3( -14.5000,  5.7000, 0 ),
			new THREE.Vector3( -14.4000, 14.9000, 0 )
		);

	this.thirdPath = new THREE.CubicBezierCurve3(
			new THREE.Vector3( -14.4000, 14.9000, 0 ),
			new THREE.Vector3( -14.4000, 18.5000, 0 ),
			new THREE.Vector3(  -6.200,  13.3000, 0 ),
			new THREE.Vector3(   1.0000, 15.0000, 0 )
		);

	// // Replace materials with MeshNormal Material
	// geom.traverse(function(obj) {
	// 	if (obj instanceof THREE.Mesh) {
	// 		obj.material = new THREE.MeshNormalMaterial();
	// 	}
	// });

	// // Put it inside us


	// // Put a 'statue'
	// this.teapot = this.database['introduction/models/teapot'];
	// this.teapot.traverse(function(obj) {
	// 	if (obj instanceof THREE.Mesh) {
	// 		obj.material = new THREE.MeshNormalMaterial();
	// 	}
	// });

	// // Align it
	// this.teapot.position.set( 2.5, 17, 2 );
	// this.teapot.rotateX( Math.PI/2 );
	// this.add( this.teapot );

	// // Put a podium
	// var box = new THREE.BoxGeometry(1,1,2);
	// var podium = new THREE.Mesh( box, new THREE.MeshNormalMaterial() );
	// podium.position.set( 2.5, 17, 1 );
	// this.add( podium );

	// // Prepare left intersecting box
	// var interaction = new THREE.Mesh(
	// 	new THREE.BoxGeometry( 1, 1, 4, 1, 1, 1 ),
	// 	new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
	// );
	// interaction.position.set( 2.5, 17, 2 );
	// interaction.material.visible = false;
	// this.add( interaction );

	// // Make it interactive
	// Iconeezin.API.makeInteractive( interaction, {
	// 	gaze: true,
	// 	title: "Start Experiment",
	// 	onInteract: (function() {

	// 		// This experiment is completed
	// 		Iconeezin.Runtime.Experiments.experimentCompleted();

	// 	}).bind(this)
	// });

}

/**
 * Start experiment when shown
 */
Experiment.prototype.onShown = function() {
	var db = this.database;

	Iconeezin.Util.createSequence()

		///////////////////////////////////////
		// Introduction
		///////////////////////////////////////
		.playAudio( db['introduction/sounds/intro/1'] )
		.select((function(sequencer) {

			// Playback either VR navigation or PC navigation
			if (!Iconeezin.Runtime.Video.hmd) {
				sequencer.playAudio( db['introduction/sounds/intro/2a'] )
			} else {
				sequencer.playAudio( db['introduction/sounds/intro/2b'] )
			}

		}).bind(this))
		.playAudio( db['introduction/sounds/intro/3'] )

		///////////////////////////////////////
		// Wait for item selection
		///////////////////////////////////////
		.waitFor((function(callback) {

			// Enable interactive object
			Iconeezin.Runtime.Interaction.setInteractive( this.interactivePoster, true );

			// Wait for user to gaze
			this.interactionConfirmCallback = (function() {
				Iconeezin.Runtime.Interaction.setInteractive( this.interactivePoster, false );
				this.interactionConfirmCallback = null;
				callback();
			}).bind(this);

		}).bind(this))
		.waitFor((function(callback) {
			Iconeezin.Runtime.Controls.followPath(
				this.firstPath,
				{
					speed: 1,
					callback: function(v) {
						if (v === 1) callback();
					}
				}
			);
		}).bind(this))

		///////////////////////////////////////
		// Greet and prepare for voice input
		///////////////////////////////////////
		.playAudio( db['introduction/sounds/intro/4'] )
		.do((function() {
			db['introduction/sounds/intro/4b'].play();
		}).bind(this))
		.waitFor((function(callback) {
			Iconeezin.Runtime.Controls.followPath(
				this.secondPath,
				{
					speed: 1,
					callback: function(v) {
						if (v === 1) callback();
					}
				}
			);
		}).bind(this))
		.playAudio( db['introduction/sounds/intro/4c'] )

		///////////////////////////////////////
		// Voice Input
		///////////////////////////////////////
		.waitFor((function(callback) {

    	var readInput = (function() {

		    // Run voice command recognition
		    Iconeezin.Runtime.Audio.voiceCommands.setLanguage( 'el-GR' );
		    Iconeezin.Runtime.Audio.voiceCommands.expectCommands({

		      'κατ[αά]λαβα πως πρ[εέ]πει να μιλ[αά]ω': function() {
		      	callback();
		      }

		    }, function(error, lastTranscript) {
		      Iconeezin.Runtime.Video.glitch(250);
		      if (error != null) {
		        // Engine error
		        db['introduction/sounds/reco/error'].play();
		        setTimeout(readInput, 3500);
		      } else {
		        // No command matched
		        db['introduction/sounds/reco/mismatch'].play();
		        setTimeout(readInput, 3500);
		      }
		    }, 'Πείτε το κείμενο που βλέπετε');

    	}).bind(this);

	    // Initial chain trigger
	    readInput();

		}).bind(this))

		///////////////////////////////////////
		// Start moving and talk about success
		///////////////////////////////////////
		.do((function() {
			Iconeezin.Runtime.Controls.followPath(
				this.thirdPath,
				{
					speed: 1
				}
			);
		}).bind(this))
		.playAudio( db['introduction/sounds/intro/5'] )
		.do((function() {

			// Complete experiment
			Iconeezin.Runtime.Experiments.experimentCompleted();

		}).bind(this))

		///////////////////////////////////////
		.start();

}

/**
 * Start experiment when shown
 */
Experiment.prototype.onUpdate = function( delta ) {

	// this.teapot.rotateY( 0.0025 * delta );
	// this.teapot.rotation.y += 0.0025 * delta;

}

/**
 * Expose experiment entry point
 */
module.exports = Experiment;
