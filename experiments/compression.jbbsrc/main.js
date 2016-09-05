
var THREE = require('three');
var Iconeezin = require('iconeezin');
var InfiniteGround = require('./lib/InfiniteGround');
var Objects = require('./lib/Objects');

/**
 * Experiment logic
 */
var Experiment = function( db ) {
	Iconeezin.API.Experiment.call(this, db);
  this.objects = new Objects(db);

	// Camera enters from corridor entrance
	this.anchor.position.set( 0, 0, 0 );
	this.anchor.direction.set( 0, 1, 0 );

  this.add(this.sea = new InfiniteGround({objects: this.objects, db: db}));
  this.sea.position.set(0, 0, -2);

  this.direction = new THREE.Vector3(0, 0, 0);

  this.fog = new THREE.FogExp2(0xbcc9d0, 0.02);


  var keyLight = new THREE.DirectionalLight( 0x999999, 1 );
  keyLight.position.set( 1, 1, -1 );
  this.add(keyLight);

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
