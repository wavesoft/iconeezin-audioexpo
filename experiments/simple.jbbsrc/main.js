
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

	this.corridors = new CorridorLogic( geom )
	this.add( this.corridors );

	// this.add( geom );

	// var geom = db['simple/geometry/corridor'];
	// var mesh = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );
	// this.add( mesh );

	// Add a light
	// this.add( new THREE.AmbientLight(0xffffff) );

	// var geometry = new THREE.BoxGeometry( 10, 10, 10 );
	// var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );

	// // Create a bunch of cubes
	// this.cubes = [];
	// for (var i=0; i<500; i++) {
	// 	var cube = new THREE.Mesh( geometry, material );
	// 	cube.position.set(
	// 			Math.random() * 500 - 250,
	// 			Math.random() * 500 - 250,
	// 			Math.random() * 500 - 250
	// 		);
	// 	cube.rotation.set(
	// 			Math.random() * 3,
	// 			Math.random() * 3,
	// 			Math.random() * 3
	// 		);
	// 	this.cubes.push(cube);

	// 	// Put on scene
	// 	this.add( cube );

	// }

	this.t = 0;

	// // Create some point light 
	// var light = new THREE.PointLight( 0xffffff, 1, 1000 );
	// light.position.set( 50,50,50 );
	// this.add( light );

};

/**
 * Subclass from IconeezinAPI.Experiment
 */
Experiment.prototype = Object.create( IconeezinAPI.Experiment.prototype );

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
