
var THREE = require('three');
var Iconeezin = require('iconeezin');

/**
 * Experiment logic
 */
var Experiment = function( db ) {
	Iconeezin.API.Experiment.call(this, db);

};

/**
 * Subclass from Iconeezin.API.Experiment
 */
Experiment.prototype = Object.create( Iconeezin.API.Experiment.prototype );

/**
 * Start experiment when shown
 */
Experiment.prototype.onShown = function() {

}

/**
 * Expose experiment entry point
 */
module.exports = Experiment;
