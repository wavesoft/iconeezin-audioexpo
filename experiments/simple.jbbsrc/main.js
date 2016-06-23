
var THREE = require('three');
var IconeezinAPI = require('iconeezin/api');

var CorridorLogic = require('./lib/CorridorLogic');

/**
 * Experiment logic
 */
var Experiment = function( db ) {
	IconeezinAPI.Experiment.call(this, db);

	// Camera enters from corridor entrance
	this.anchor.position.set( 0, 0, 3 );
	this.anchor.direction.set( 0, 1, 0 );

	// Get corridor geometry & bring to proper coordinates
	var geom = db['simple/models/corridor'];

	// Replace materials with MeshNormal Material
	geom.traverse(function(obj) {
		if (obj instanceof THREE.Mesh) {
			obj.material = new THREE.MeshNormalMaterial();
		}
	});

	// Create corridors
	this.corridors = new CorridorLogic( geom )
	this.add( this.corridors );

};

/**
 * Subclass from IconeezinAPI.Experiment
 */
Experiment.prototype = Object.create( IconeezinAPI.Experiment.prototype );

/**
 * Start experiment when shown
 */
Experiment.prototype.onShown = function() {

	var experimentIteration = (function() {
		this.corridors.runExperiment( function(dir) {

			// Loop
			console.log("dir =",dir);
			experimentIteration();

		});
	}).bind(this);

	experimentIteration();
}

/**
 * Register a render update function
 */
Experiment.prototype.onUpdate = function(delta) {

	// for (var i=0; i<this.cubes.length; i++) {
	// 	this.cubes[i].rotation.z += delta / 1000;
	// 	this.cubes[i].rotation.x += delta / 1000;
	// }

	// this.t += delta / 10000;
	// // this.m.position.z = Math.sin(this.t) * 10;

	// this.geom.rotation.z += delta / 1000;
	// this.geom.rotation.x += delta / 1000;

	// this.corridors.position.z = -((Math.sin(this.t)+1)/2.0) * 20;

	// this.corridors.onUpdate( delta );

}

module.exports = Experiment;
