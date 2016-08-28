
var THREE = require('three');
var Iconeezin = require('iconeezin');
var InfiniteSea = require('./lib/InfiniteSea');

/**
 * Experiment logic
 */
var Experiment = function( db ) {
	Iconeezin.API.Experiment.call(this, db);

	// Camera enters from corridor entrance
	this.anchor.position.set( 0, 0, 0 );
	this.anchor.direction.set( 0, 1, 0 );

  this.add(this.sea = new InfiniteSea());
  this.sea.position.set(0,0,-2);

  this.direction = new THREE.Vector3(0,0,0);

};

/**
 * Subclass from Iconeezin.API.Experiment
 */
Experiment.prototype = Object.create( Iconeezin.API.Experiment.prototype );

/**
 * Initialize experiment when it became visible
 */
Experiment.prototype.onShown = function() {

  Iconeezin.Runtime.Controls.infiniteNavigationUsing( this );

}

/**
 * Update infinite sea animation
 */
Experiment.prototype.onUpdate = function( delta ) {

  this.sea.update( delta, this.direction );

}

Experiment.prototype.onOrientationChange = function( quaternion ) {

  // Calculate the direction vector that will be used by the
  // infinite sea to calculate the direction
  this.direction.set(0, 0, -1);
  this.direction.applyQuaternion(quaternion);

}

/**
 * Expose experiment entry point
 */
module.exports = Experiment;
