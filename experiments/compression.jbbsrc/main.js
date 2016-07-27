
var THREE = require('three');
var Iconeezin = require('iconeezin');

/**
 * Experiment logic
 */
var Experiment = function( db ) {
	Iconeezin.API.Experiment.call(this, db);

	// Camera enters from corridor entrance
	this.anchor.position.set( 0, 1.2, 2 );
	this.anchor.direction.set( 0, 1, 0 );

};

/**
 * Subclass from Iconeezin.API.Experiment
 */
Experiment.prototype = Object.create( Iconeezin.API.Experiment.prototype );

/**
 * Expose experiment entry point
 */
module.exports = Experiment;
