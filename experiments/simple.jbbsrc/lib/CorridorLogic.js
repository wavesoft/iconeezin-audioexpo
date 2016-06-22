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

/**
 * Corridor logic object
 */
var CorridorLogic = function( corridor ) {
	THREE.Object3D.call(this);

	// Create three different corridors
	this.objects = [];
	for (var i=0; i<4; i++) {

		// Create a few invisible items
		var obj = corridor.clone();
		obj.visible = false;
		this.objects.push(obj);

		// Put them as my children
		this.add(obj);

	}

	// 16.192392349243164, y: 0, z: 43.19241714477539
	// -19.0919, 41.9914
	// x=2.8996, y=1.201

	// Prepare transformation matrices
	this.matLeft = new THREE.Matrix4();
	this.matLeft.multiply( new THREE.Matrix4().makeTranslation( -19.0919, 41.9914, 0) );
	this.matLeft.multiply( new THREE.Matrix4().makeRotationZ( Math.PI/4 ) );

	this.matRight = new THREE.Matrix4();
	this.matRight.multiply( new THREE.Matrix4().makeTranslation( 19.0919, 41.9914, 0) );
	this.matRight.multiply( new THREE.Matrix4().makeRotationZ( -Math.PI/4 ) );

	// Left and right camera splines
	this.splineLeft = new THREE.CubicBezierCurve3(
			new THREE.Vector3(   0.0000, 0.00000, 3 ),
			new THREE.Vector3(   0.0000, 22.0000, 3 ),
			new THREE.Vector3(   0.0000, 22.0000, 3 ),
			new THREE.Vector3( -19.0919, 41.9914, 3 )
		);
	this.splineRight = new THREE.CubicBezierCurve3(
			new THREE.Vector3(   0.0000, 0.00000, 3 ),
			new THREE.Vector3(   0.0000, 22.0000, 3 ),
			new THREE.Vector3(   0.0000, 22.0000, 3 ),
			new THREE.Vector3(  19.0919, 41.9914, 3 )
		);

	this.i = 1;
	this.objects[0].visible = true;
	this.createCrossing( this.objects[0] );

	// this.objects[0].applyMatrix( this.matLeft );
	// this.objects[1].applyMatrix( this.matRight );

	// this.objects[3].applyMatrix( this.matLeft );
	// this.objects[3].applyMatrix( this.matLeft );

	this.t = -Math.PI/2;
	// this.i = 0;

	var loop_animation = (function(v) {
		if (v < 1.0) return;
		Iconeezin.Runtime.Controls.followPath( this.splineLeft, {
			'speed': 2, 
			'callback': loop_animation
		});
	}).bind(this);

	loop_animation(1.0);

}

// Subclass from Aniamted Object3D
CorridorLogic.prototype = Object.create( THREE.Object3D.prototype );

/**
 * Build the tree path for the given object
 */
CorridorLogic.prototype.createCrossing = function( reference ) {

	// Pick left and right candidate objects
	var oL = this.objects[this.i];
	this.i = (this.i + 1) % this.objects.length;
	var oR = this.objects[this.i];
	this.i = (this.i + 1) % this.objects.length;

	// Make sure they are visible
	oL.visible = true;
	oR.visible = true;

	// Copy matrices from the reference object
	oL.matrix.copy( reference.matrix );
	oR.matrix.copy( reference.matrix );

	// Apply left + right matrices
	oL.applyMatrix( this.matLeft );
	oR.applyMatrix( this.matRight );

}

/**
 * Handle update
 */
CorridorLogic.prototype.onUpdate = function(delta) {

	this.t += delta / 1000;

	var prev = Iconeezin.Runtime.Video.viewport.camera.position.clone();

	// var axis = new THREE.Vector3();
	// var up = new THREE.Vector3(0, 1, 0);

	var i = (1 + Math.sin(this.t)) / 2.0
	var spline = this.splineRight;

	var p_point = spline.getPointAt( i );
	// var p_next = spline.getPointAt( i+0.01 );

	var p_next = p_point.clone()
					.sub( Iconeezin.Runtime.Video.viewport.camera.position )
					.add( p_point );

	Iconeezin.Runtime.Video.viewport.camera.position.copy( p_point );
	Iconeezin.Runtime.Video.viewport.camera.lookAt( p_next, new THREE.Vector3(0,1,0) );

	// var p_tangent = spline.getTangentAt( i ).normalize();

 	// axis.crossVectors( up, p_tangent ).normalize();
    // var radians = Math.acos( up.dot( p_tangent ) );

	// Iconeezin.Runtime.Video.viewport.camera.position.copy( p_point );
    // Iconeezin.Runtime.Video.viewport.camera.quaternion.setFromAxisAngle( axis, radians );

};

/**
 * Implement the animation function
 */
module.exports = CorridorLogic;
