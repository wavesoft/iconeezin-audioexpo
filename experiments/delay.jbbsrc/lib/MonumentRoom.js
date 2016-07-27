
var THREE = require('three');
var Iconeezin = require('iconeezin');

var MonumentRoom = function( geom ) {
	THREE.Object3D.call(this);

	this.kionokranoMesh = geom['delay/models/kionokrano'];
	this.podiumObject = geom['delay/models/podium'];
	this.length = 0;

	// Prepare materials
	this.wallsMaterial = new THREE.MeshNormalMaterial({ side: THREE.BackSide });
	this.ceilingMaterial = new THREE.MeshNormalMaterial({ });
	this.floorMaterial = new THREE.MeshNormalMaterial({ });
	this.pillarMaterial = new THREE.MeshNormalMaterial({ });
	this.kionokranoMaterial = new THREE.MeshNormalMaterial({ });
	this.frameMaterial = new THREE.MeshNormalMaterial({ });
	this.podiumMaterial = new THREE.MeshNormalMaterial({ });

	// Create a podium material
	var canvas = document.createElement('canvas');
	canvas.width = 2048;
	canvas.height = 1024;

	// Create texture & get context handler
	this.podiumMessageCtx = canvas.getContext('2d');
	this.podiumMessageTexture = new THREE.Texture(canvas);

	// Create message material
	this.podiummessageMaterial = new THREE.MeshBasicMaterial({
	    map: this.podiumMessageTexture,
	    transparent: false,
	    color: 0xffffff
	});

	this.setPodiumMessage("This","is","a","test");

	this.pathEnter = null;
	this.pathLeave = null;

};

MonumentRoom.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
	constructor: MonumentRoom,

	/**
	 * Update the podium message
	 */
	'setPodiumMessage': function( line1, line2, line3, line4 ) {
		var ctx = this.podiumMessageCtx;

		ctx.clearRect(0, 0, 2048, 1024);
		ctx.textAlign = "center"; 
		ctx.font="110px bold Tahoma"; 
		ctx.fillStyle = "#ffffff";
		ctx.fillText( line1||"", 1024, 366 );
		ctx.fillText( line2||"", 1024, 498 );
		ctx.fillText( line3||"", 1024, 631 );
		ctx.fillText( line4||"", 1024, 763 );

		this.podiumMessageTexture.needsUpdate = true;
	},

	/**
	 * Update podium message progress
	 */
	'setPodiumMessageProgress': function( progress ) {

	},

	/**
	 * Rebuild monument room with the given scale
	 */
	'rebuild': function( scale ) {
		var pillarHeight = 5,
			frameHeight = 0.25,
			innerPadding = 1,
			height = (pillarHeight + frameHeight) * scale,
			length = 10 * scale,
			width = 6 * scale,
			innerLength = length - innerPadding,
			innerWidth = width - innerPadding;

		// Reset
		this.reset();

		// Create wall box
		this.addWalls( length, width, height );

		// Create side pillars
		var lPillars = Math.round(innerLength / 4),
			sPillars = innerLength / lPillars,
			xLeft = -(innerWidth/2), xRight = (innerWidth/2);
		for (var i=0, y=1; i<=lPillars; i++, y+=sPillars) {
			this.addPillars( xLeft, y, pillarHeight, frameHeight, scale );
			this.addPillars( xRight, y, pillarHeight, frameHeight, scale );
		}

		// Create front pillars
		if (scale >= 2) {
			var wPillars = 2 * scale,
				wsPillars = innerWidth / wPillars;
			for (var i=0, x=xLeft+wsPillars; i<wPillars-1; i++, x+=wsPillars) {
				if (i == (wPillars-2)/2) continue; // Gap in the middle
				this.addPillars( x, innerPadding, pillarHeight, frameHeight, scale );
				this.addPillars( x, innerLength+innerPadding, pillarHeight, frameHeight, scale );
			}
		}

		// Add junction frames
		this.addJunctionFrames( innerLength, innerWidth, innerPadding, 
								pillarHeight + frameHeight, frameHeight, scale );

		// Put a new podium in the middle
		var podium = this.podiumObject.clone();
		podium.position.set( 0,innerLength/2+innerPadding,0 );
		podium.children[0].material = this.podiumMaterial;
		podium.children[1].material = this.podiummessageMaterial;
		this.add(podium);

		// Prepare the enter and leave paths
		this.pathEnter = new THREE.CubicBezierCurve3(
			new THREE.Vector3( 0.0000, 1.00000, 0 ),
			new THREE.Vector3( 0.0000, 2.00000, 0 ),
			new THREE.Vector3( 0.0000, podium.position.y-3, 0.1 ),
			new THREE.Vector3( 0.0000, podium.position.y-2, 0.2 )
		);
		this.pathLeave = new THREE.CubicBezierCurve3(
			new THREE.Vector3( 0.0000, podium.position.y-2, 0.2 ),
			new THREE.Vector3( -4.0, podium.position.y+length/5, 0.1 ),
			new THREE.Vector3( 0.0000, length-7, 0.0 ),
			new THREE.Vector3( 0.0000, length, 0.0 )
		);

		// Keep properties
		this.length = length;

	},

	/**
	 * Remove all children
	 */
	'reset': function() {

		// Dispatch all children
		for (var i=0; i<this.children.length; i++) {
			this.children[i].parent = null;
			this.children[i].dispatchEvent( { type: 'removed' } );
		}

		// Clear
		this.children = [];

	},

	'addWalls': function( length,width,height ) {

		//
		// Create a box that will render the walls
		//
		var boxGeom = new THREE.BoxGeometry( width,length,height+0.5,1,1,1 );
		var boxMesh = new THREE.Mesh( boxGeom, this.wallsMaterial );

		boxMesh.position.set( 0, length/2, height/2 );
		this.add(boxMesh);

		//
		// Create the top and bottom planes for rendering ceiling and floor
		//
		var planeGeom = new THREE.PlaneGeometry( width,length, 1, 1 );
		var topPlaneMesh = new THREE.Mesh( planeGeom, this.ceilingMaterial );
		var botPlaneMesh = new THREE.Mesh( planeGeom, this.floorMaterial );

		topPlaneMesh.position.set( 0, length/2, height );
		topPlaneMesh.rotation.set( Math.PI, 0, 0 );
		this.add(topPlaneMesh);

		botPlaneMesh.position.set( 0, length/2, 0 );
		this.add(botPlaneMesh);

	},

	'addPillars': function( x,y,height,spacing,repeats ) {
		var z = 0, step = height + spacing;
		for (var i=0; i<repeats; i++, z += step) {
			this.addPillar(x,y,z,height);
		}
	},

	'addPillar': function( x,y,z,height ) {

		// Remove height of kionokrano
		height -= 0.4;

		//
		// Pillar
		//
		var geom = new THREE.CylinderBufferGeometry( 0.25, 0.4, height, 6, 1 );
		var mesh = new THREE.Mesh( geom, this.pillarMaterial );

		mesh.position.set( x, y, z+height/2 );
		mesh.rotation.set( Math.PI/2, 0, 0 );
		this.add( mesh );

		//
		// Kionokrano
		//
		var mesh = this.kionokranoMesh.children[0].clone();
		mesh.material = this.kionokranoMaterial;
		mesh.position.set( x,y,z+height );
		this.add( mesh );

	},

	'addJunctionFrames': function( length, width, padding, step, frameHeight, repeats ) {
		var z = step;
		for (var i=0; i<repeats; i++, z+=step) {
			this.addJunctionFrame( length, width, z, padding, frameHeight );
		}
	},

	'addJunctionFrame': function( length, width, z, padding, frameHeight ) {
		var frameWidth = 1.0;
		var xGeom = new THREE.BoxGeometry( frameWidth, length+frameWidth, frameHeight );
		var yGeom = new THREE.BoxGeometry( width+frameWidth, frameWidth, frameHeight );

		var meshL = new THREE.Mesh( xGeom, this.frameMaterial );
		var meshR = new THREE.Mesh( xGeom, this.frameMaterial );
		var meshN = new THREE.Mesh( yGeom, this.frameMaterial );
		var meshF = new THREE.Mesh( yGeom, this.frameMaterial );

		meshL.position.set( -width/2, length/2+padding, z-frameHeight/2 );
		meshR.position.set(  width/2, length/2+padding, z-frameHeight/2 );
		meshN.position.set(  0, padding, z-frameHeight/2 );
		meshF.position.set(  0, length+padding, z-frameHeight/2 );

		this.add( meshL );
		this.add( meshR );
		this.add( meshN );
		this.add( meshF );

	}

});

module.exports = MonumentRoom;