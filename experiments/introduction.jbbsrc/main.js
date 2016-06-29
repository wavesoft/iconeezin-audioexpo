
var THREE = require('three');
var Iconeezin = require('iconeezin');

/**
 * Experiment logic
 */
var Experiment = function( db ) {
	Iconeezin.API.Experiment.call(this, db);

	// Camera enters in the center, looking away from the door
	this.anchor.position.set( 10, 15, 3 );
	this.anchor.direction.set( 0, 1, 0 );

	// Get lobby model from database
	var geom = db['introduction/models/lobby'];

	// Replace materials with MeshNormal Material
	geom.traverse(function(obj) {
		if (obj instanceof THREE.Mesh) {
			obj.material = new THREE.MeshNormalMaterial();
		}
	});

	// Put it inside us
	this.add( geom );


	// Put a 'statue'
	this.teapot = this.database['introduction/models/teapot'];
	this.teapot.traverse(function(obj) {
		if (obj instanceof THREE.Mesh) {
			obj.material = new THREE.MeshNormalMaterial();
		}
	});

	// Align it
	this.teapot.position.set( 2.5, 17, 2 );
	this.teapot.rotateX( Math.PI/2 );
	this.add( this.teapot );

	// Put a podium
	var box = new THREE.BoxGeometry(1,1,2);
	var podium = new THREE.Mesh( box, new THREE.MeshNormalMaterial() );
	podium.position.set( 2.5, 17, 1 );
	this.add( podium );

	// Prepare left intersecting box
	var interaction = new THREE.Mesh(
		new THREE.BoxGeometry( 1, 1, 4, 1, 1, 1 ),
		new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
	);
	interaction.position.set( 2.5, 17, 2 );
	interaction.material.visible = false;
	this.add( interaction );

	// Make it interactive
	Iconeezin.API.makeInteractive( interaction, {
		gaze: true,
		title: "Start Experiment",
		onInteract: (function() {
			Iconeezin.Runtime.Experiments.showExperiment("simple");
		}).bind(this)
	});

};

/**
 * Subclass from Iconeezin.API.Experiment
 */
Experiment.prototype = Object.create( Iconeezin.API.Experiment.prototype );

/**
 * Start experiment when shown
 */
Experiment.prototype.onShown = function() {

	this.database['introduction/sounds/intro'].play();

}

/**
 * Start experiment when shown
 */
Experiment.prototype.onUpdate = function( delta ) {

	this.teapot.rotateY( 0.0025 * delta );
	// this.teapot.rotation.y += 0.0025 * delta;

}

/**
 * Expose experiment entry point
 */
module.exports = Experiment;
