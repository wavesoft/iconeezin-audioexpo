"use strict";
/**
 * Iconeez.in - A Web VR Platform for social AnimatedObject3Ds
 * Copyright (C) 2015 Ioannis Charalampidis <ioannis.charalampidis@cern.ch>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * @author Ioannis Charalampidis / https://github.com/wavesoft
 */

var Iconeezin = require('iconeezin');
var THREE = require('three');

const DIRECTION_UNKNOWN = -1;
const DIRECTION_LEFT = 0;
const DIRECTION_RIGHT = 1;

/**
 * Corridor logic object
 */
var CorridorLogic = function( corridor ) {
	THREE.Object3D.call(this);

	// Create three different corridors
	this.objects = [];
	for (var i=0; i<5; i++) {

		// Create a few invisible items
		var obj = corridor.clone();
		obj.visible = false;
		this.objects.push(obj);

		// Put them as my children
		this.add(obj);

	}

	// Zero matrix
	this.zeroMatrix = this.objects[0].matrix.clone();

	// Prepare transformation matrices
	this.matLeft = new THREE.Matrix4();
	this.matLeft.multiply( new THREE.Matrix4().makeTranslation( -19.0919, 41.9914, 0) );
	this.matLeft.multiply( new THREE.Matrix4().makeRotationZ( Math.PI/4 ) );

	this.matRight = new THREE.Matrix4();
	this.matRight.multiply( new THREE.Matrix4().makeTranslation( 19.0919, 41.9914, 0) );
	this.matRight.multiply( new THREE.Matrix4().makeRotationZ( -Math.PI/4 ) );

	// Prepare left intersecting box
	this.leftInteraction = new THREE.Mesh(
		new THREE.BoxGeometry( 14, 20, 12, 1, 1, 1 ),
		new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
	);
	this.leftInteraction.position.set( 0, 10, 6 );
	this.leftInteraction.updateMatrix();
	this.leftInteraction.material.visible = false;

	// Clone to right interaction box
	this.rightInteraction = this.leftInteraction.clone();

	// Prepare intersection box transformation matrices
	var tboxMatrix = new THREE.Matrix4();
	tboxMatrix.makeTranslation( -6.36396,29.2635, 0);
	tboxMatrix.multiply( new THREE.Matrix4().makeRotationZ( Math.PI/4 ) );
	this.leftInteraction.applyMatrix( tboxMatrix );
	tboxMatrix.makeTranslation( 6.36396,29.2635, 0);
	tboxMatrix.multiply( new THREE.Matrix4().makeRotationZ( -Math.PI/4 ) );
	this.rightInteraction.applyMatrix( tboxMatrix );

	// Left and right camera paths
	this.pathLeft = new THREE.CubicBezierCurve3(
			new THREE.Vector3(   0.0000, 0.00000, 3 ),
			new THREE.Vector3(   0.0000, 22.0000, 3 ),
			new THREE.Vector3(   0.0000, 22.0000, 3 ),
			new THREE.Vector3( -19.0919, 41.9914, 3 )
		);
	this.pathRight = new THREE.CubicBezierCurve3(
			new THREE.Vector3(   0.0000, 0.00000, 3 ),
			new THREE.Vector3(   0.0000, 22.0000, 3 ),
			new THREE.Vector3(   0.0000, 22.0000, 3 ),
			new THREE.Vector3(  19.0919, 41.9914, 3 )
		);

	this.freeObject = 1;

	////////////////////////////////////////////////////////
	// Interaction Logic
	////////////////////////////////////////////////////////

	// Initial reference object
	this.referenceObject = this.objects[0];
	this.leftObject = null;
	this.rightObject = null;

	// Current direction
	this.direction = DIRECTION_UNKNOWN;
	this.canChangeDirection = true;

	// Make them interactive
	Iconeezin.API.makeInteractive( this.leftInteraction, {
		gaze: true,
		onInteract: (function() {
			if (!this.canChangeDirection) return;
			this.setDirection( DIRECTION_LEFT );
		}).bind(this)
	});
	Iconeezin.API.makeInteractive( this.rightInteraction, {
		gaze: true,
		onInteract: (function() {
			if (!this.canChangeDirection) return;
			this.setDirection( DIRECTION_RIGHT );
		}).bind(this)
	});

}

// Subclass from Aniamted Object3D
CorridorLogic.prototype = Object.create( THREE.Object3D.prototype );

/**
 * Run experiment and callback when we have results and we can 
 * immediately chain another experiment
 */
CorridorLogic.prototype.runExperiment = function( initial_direction, cbFinal, cbComplete ) {
	var calledFinal = false;

	// Create a new corridor crossing
	//
	// It returns the [left,right] corridor objects
	// to be used as our next reference object.
	//
	// console.log("----[ Reference ]----------------");
	// console.log("uuid=",this.referenceObject.uuid);
	// console.log("pos=",this.referenceObject.position);
	// console.log("rot=",this.referenceObject.rotation);
	// console.log("scl=",this.referenceObject.scale);
	// console.log("---------------------------------");
	var corridors = this.createCrossing( this.referenceObject );

	// Reset properties
	this.direction = DIRECTION_UNKNOWN;
	this.canChangeDirection = true;

	// Turn on interaction
	this.leftInteraction.visible = true;
	this.rightInteraction.visible = true;

	// Start camera path on a random direction
	Iconeezin.Runtime.Controls.followPath( 
		[ this.pathLeft, this.pathRight ][initial_direction], {
		'speed': 4, 
		'matrix': this.referenceObject.matrix.clone(),
		'callback': (function(v) {
			if (v == 1) {

				// Pick final direction
				var f_direction = this.direction;
				if (f_direction === DIRECTION_UNKNOWN)
					f_direction = initial_direction;

				// Chose appropriate reference object for next corridor building
				this.referenceObject = corridors[ f_direction ];

				// Callback when completed
				cbComplete( this.direction );

			} else if (v < 0.5) {

				// Up to 50% of animation, we can change direction
				this.canChangeDirection = true;

			} else {

				// After that we cannot change direction any longer
				this.canChangeDirection = false;

				// Call final callback when user cannot turn any more
				if (!calledFinal) {

					// Call final
					cbFinal( this.direction );
					calledFinal = true;

					// Turn off further interaction
					this.leftInteraction.visible = false;
					this.rightInteraction.visible = false;

				}

			}
		}).bind(this)
	});

}

/**
 * Set direction to left or right
 */
CorridorLogic.prototype.setDirection = function( direction ) {
	switch (direction) {

		case DIRECTION_LEFT:
			console.log("Switching to LEFT");
			Iconeezin.Runtime.Controls.replaceFollowPath( this.pathLeft );
			break;

		case DIRECTION_RIGHT:
			console.log("Switching to RIGHT");
			Iconeezin.Runtime.Controls.replaceFollowPath( this.pathRight );
			break;

	}

	// Update direction
	this.direction = direction;
}

/**
 * Build the tree path for the given object
 */
CorridorLogic.prototype.createCrossing = function( reference ) {

	// Pick left and right candidate objects
	var oL = this.objects[this.freeObject];
	this.freeObject = (this.freeObject + 1) % this.objects.length;
	var oR = this.objects[this.freeObject];
	this.freeObject = (this.freeObject + 1) % this.objects.length;

	// Make sure they are visible
	reference.visible = true;
	oL.visible = true;
	oR.visible = true;

	// Copy matrices from the reference object
	oL.matrix.copy( this.zeroMatrix );
	oR.matrix.copy( this.zeroMatrix );

	// Apply left + right matrices
	oL.applyMatrix( this.matLeft );
	oL.applyMatrix( reference.matrix );
	oR.applyMatrix( this.matRight );
	oR.applyMatrix( reference.matrix );

	// Put interactions
	reference.add( this.leftInteraction );
	reference.add( this.rightInteraction );

	// Return left/right objects
	return [oL, oR];

}

/**
 * Implement the animation function
 */
module.exports = CorridorLogic;
