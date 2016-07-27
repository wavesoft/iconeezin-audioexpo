
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

	this.monument = new MonumentRoom( db );
	this.monument.rebuild(1);
	this.add(this.monument);

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
Experiment.prototype.onWillShow = function( callback ) {

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

	// Callback immediately
	callback();

}

/**
 * Expose experiment entry point
 */
module.exports = Experiment;
