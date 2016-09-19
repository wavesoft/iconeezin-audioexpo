
var THREE = require('three');
var Iconeezin = require('iconeezin');

var MonumentRoom = function( geom, materials ) {
	THREE.Object3D.call(this);

	this.kionokranoMesh = geom['delay/models/kionokrano'];
	this.podiumObject = geom['delay/models/podium'];

	// Prepare materials
	this.wallsMaterial = materials.wallsMaterial;
	this.ceilingMaterial = materials.ceilingMaterial;
	this.floorMaterial = materials.floorMaterial;
	this.pillarMaterial = materials.pillarMaterial;
	this.kionokranoMaterial = materials.kionokranoMaterial;
	this.frameMaterial = materials.frameMaterial;
	this.podiumMaterial = materials.podiumMaterial;
	this.doorMaterial = materials.doorMaterial;
	this.doorFrameMaterial = materials.doorFrameMaterial;

	// Create a podium material
	var canvas = document.createElement('canvas');
	canvas.width = 2048;
	canvas.height = 1024;

	// Create texture & get context handler
	this.podiumMessageCtx = canvas.getContext('2d');
	this.podiumMessageTexture = new THREE.Texture(canvas);
	this.podiumMessageLines = [];
	this.podiumMessageProgress = 0;

	// Create message material
	this.podiummessageMaterial = new THREE.MeshBasicMaterial({
	    map: this.podiumMessageTexture,
	    transparent: false,
	    color: 0xffffff
	});

	// Local properties
	this.pathEnter = null;
	this.pathLeave = null;
	this.length = 0;

	// this.lightA = new THREE.PointLight(0xffffff, 0.25);
	// this.lightA.castShadow = true;
	// this.lightB = new THREE.PointLight(0xffffff, 0.25);
	// this.lightB.castShadow = true;

};

MonumentRoom.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
	constructor: MonumentRoom,

	setupMataerials: function() {

	},

	/**
	 * Redraw the podium message
	 */
	redrawPodiumMessage: function() {
		var ovd = 25,
			ctx = this.podiumMessageCtx,
			l1 = this.podiumMessageLines[0] || "",
			l2 = this.podiumMessageLines[1] || "",
			l3 = this.podiumMessageLines[2] || "",
			l4 = this.podiumMessageLines[3] || "",
			chars = l1.length + l2.length + l3.length + l4.length;

		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, 2048, 1024);
		ctx.globalCompositeOperation = "source-over";

		// Draw message
		ctx.textAlign = "center";
		ctx.font="bold 110px Tahoma";
		ctx.fillStyle = "#ffffff";
		ctx.fillText( l1, 1024, 366 );
		ctx.fillText( l2, 1024, 498 );
		ctx.fillText( l3, 1024, 631 );
		ctx.fillText( l4, 1024, 763 );

		// Draw progress
		ctx.globalCompositeOperation = "multiply";
		ctx.fillStyle = "#ff0000";
		var p_chars = Math.round(this.podiumMessageProgress * chars),
			steps = [ [l1.length,ctx.measureText(l1).width,253],
					  [l2.length,ctx.measureText(l2).width,385],
					  [l3.length,ctx.measureText(l3).width,518],
					  [l4.length,ctx.measureText(l4).width,650] ];
		for (var i=0; i<4; i++) {
			if (p_chars <= 0) break;
			var c = steps[i][0], tW = steps[i][1], y = steps[i][2], w = tW;
			if (p_chars < c) tW *= p_chars / c;
			p_chars -= c;

			// Draw progress overlay
			ctx.fillRect( 1024-w/2-ovd,y-ovd,tW+ovd*2,113+ovd*2 );
		}

		this.podiumMessageTexture.needsUpdate = true;
	},

	/**
	 * Update the podium message
	 */
	setPodiumMessage: function( lines ) {
		this.podiumMessageLines = lines;
		this.podiumMessageProgress = 0;
		this.redrawPodiumMessage();
	},

	/**
	 * Update podium message progress
	 */
	setPodiumMessageProgress: function( progress ) {
		this.podiumMessageProgress = progress;
		this.redrawPodiumMessage();
	},

	/**
	 * Rebuild monument room with the given scale
	 */
	rebuild: function( scale ) {
		var pillarHeight = 5,
			frameHeight = 0.25,
			innerPadding = 1,
			height = (pillarHeight + frameHeight) * scale,
			length = 10 * scale,
			width = 6 * scale,
			innerLength = length - innerPadding*2,
			innerWidth = width - innerPadding*2;

		// Reset
		this.reset();

		// Create wall box
		this.addWalls( length, width, height, scale );

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
			new THREE.Vector3( 0.0000, podium.position.y-3, 0.0 ),
			new THREE.Vector3( 0.0000, podium.position.y-2, 0.0 )
		);
		this.pathLeave = new THREE.CubicBezierCurve3(
			new THREE.Vector3( 0.0000, podium.position.y-2, 0.0 ),
			new THREE.Vector3( -4.0, podium.position.y+length/5, 0.0 ),
			new THREE.Vector3( 0.0000, length-7, 0.0 ),
			new THREE.Vector3( 0.0000, length, 0.0 )
		);

		// Keep properties
		this.length = length;

		// Update lights
		// this.lightA.position.set(
		// 		0, 2/5*length, height/2
		// 	);
		// this.lightB.position.set(
		// 		0, 3/5*length, height/2
		// 	);

		// this.traverse(function(o) {
		// 	o.castShadow = true;
		// 	o.receiveShadow = true;
		// });

	},

	/**
	 * Remove all children
	 */
	reset: function() {

		// Dispatch all children
		for (var i=0; i<this.children.length; i++) {
			this.children[i].parent = null;
			this.children[i].dispatchEvent( { type: 'removed' } );
		}

		// Clear
		this.children = [];

	},

	addWalls: function( length, width, height, scale ) {

		var doorWidth = 2,
			doorHeight = 3,
			doorFrame = 0.15;

		//
		// Create geometry for the doored walls
		//
		var doorWallGeom = new THREE.Geometry();
		doorWallGeom.vertices.push(
			new THREE.Vector3( -width/2, 0, height ),
			new THREE.Vector3(  width/2, 0, height ),
			new THREE.Vector3( -width/2, 0, 0 ),
			new THREE.Vector3(  width/2, 0, 0 ),
			new THREE.Vector3( -width/2, 0, doorHeight ),
			new THREE.Vector3(  width/2, 0, doorHeight ),
			new THREE.Vector3( -doorWidth/2, 0, doorHeight ),
			new THREE.Vector3(  doorWidth/2, 0, doorHeight ),
			new THREE.Vector3( -doorWidth/2, 0, 0 ),
			new THREE.Vector3(  doorWidth/2, 0, 0 )
		);
		doorWallGeom.faces.push(
			new THREE.Face3( 0, 4, 5 ),
			new THREE.Face3( 5, 1, 0 ),
			new THREE.Face3( 4, 2, 8 ),
			new THREE.Face3( 4, 8, 6 ),
			new THREE.Face3( 7, 9, 3 ),
			new THREE.Face3( 7, 3, 5 )
		);

		// Generate UVs
		var tX = scale * 2, tY = scale * 2,
			dY = (1- (doorHeight / height)),
			dX = (doorWidth / width),
			fvUVs = [],
			uvs = [ // Vertex UVs
				new THREE.Vector2( 0, 0 ),
				new THREE.Vector2( tX, 0 ),
				new THREE.Vector2( 0, tY ),
				new THREE.Vector2( tX, tY ),
				new THREE.Vector2( 0, dY*tY ),
				new THREE.Vector2( tX, dY*tY ),
				new THREE.Vector2( (0.5 - dX)*tX, dY*tY ),
				new THREE.Vector2( (0.5 + dX)*tX, dY*tY ),
				new THREE.Vector2( (0.5 - dX)*tX, tY ),
				new THREE.Vector2( (0.5 + dX)*tX, tY )
			];
		for (var i=0; i<doorWallGeom.faces.length; ++i) {
			fvUVs.push([
					uvs[ doorWallGeom.faces[i].a ],
					uvs[ doorWallGeom.faces[i].b ],
					uvs[ doorWallGeom.faces[i].c ]
			]);
		}

		// Compute face normals
		doorWallGeom.faceVertexUvs = [ fvUVs ];
		doorWallGeom.uvsNeedUpdate = true;
		doorWallGeom.computeFaceNormals();

		//
		// Create side walls
		//
		var wTx = 4 * scale, wTy = 4 * scale;
		var sideGeometry = new THREE.PlaneBufferGeometry( width, length, 1, 1 );
		var attrib = sideGeometry.getAttribute('uv');
		attrib.needsUpdate = true;
		attrib.array.set([
			0, wTy,
			wTx, wTy,
			0, 0,
			wTx, 0
		]);

		var wallLeft = new THREE.Mesh( sideGeometry, this.wallsMaterial );
		var wallRight = new THREE.Mesh( sideGeometry, this.wallsMaterial );

		wallLeft.rotation.set( Math.PI/2, -Math.PI/2, Math.PI/2 );
		wallLeft.position.set( -width/2, length/2, height/2 );
		wallRight.rotation.set( Math.PI/2, Math.PI/2, Math.PI/2 );
		wallRight.position.set( width/2, length/2, height/2 );

		wallLeft.castShadow = true;
		wallRight.castShadow = true;

		this.add(wallLeft);
		this.add(wallRight);

		//
		// Create near and far walls
		//
		var wallNear = new THREE.Mesh( doorWallGeom, this.wallsMaterial );
		var wallFar = new THREE.Mesh( doorWallGeom, this.wallsMaterial );

		wallNear.position.set( 0, 0, 0 );
		wallFar.position.set( 0, length, 0 );
		wallFar.rotation.set( 0, 0, Math.PI );

		wallNear.castShadow = true;
		wallFar.castShadow = true;

		this.add(wallNear);
		this.add(wallFar);

		//
		// Create the top and bottom planes for rendering ceiling and floor
		//
		var cftX = 2 * scale, cftY = 3 * scale;
		var planeGeom = new THREE.PlaneBufferGeometry( width, length, 1, 1 );
		var attrib = planeGeom.getAttribute('uv');
		attrib.needsUpdate = true;
		attrib.array.set([
			0, cftY,
			cftX, cftY,
			0, 0,
			cftX, 0
		]);

		var topPlaneMesh = new THREE.Mesh( planeGeom, this.ceilingMaterial );
		var botPlaneMesh = new THREE.Mesh( planeGeom, this.floorMaterial );

		topPlaneMesh.position.set( 0, length/2, height );
		topPlaneMesh.rotation.set( Math.PI, 0, 0 );
		this.add(topPlaneMesh);

		botPlaneMesh.position.set( 0, length/2, 0 );
		botPlaneMesh.receiveShadow = true;
		this.add(botPlaneMesh);

		//
		// Create door hinges
		//
		this.doorLPivot = new THREE.Object3D();
		this.doorRPivot = new THREE.Object3D();
		this.doorLPivot.position.set( -doorWidth/2, length, 0 );
		this.doorRPivot.position.set(  doorWidth/2, length, 0 );
		this.add(this.doorLPivot);
		this.add(this.doorRPivot);

		this.doorLPivot.rotation.set( 0, 0, 0 );
		this.doorRPivot.rotation.set( 0, 0, -Math.PI );

		//
		// Create door sides
		//
		var doorGeometry = new THREE.BoxGeometry( doorWidth/2, 0.1, doorHeight );
		var doorL = new THREE.Mesh( doorGeometry, this.doorMaterial );
		var doorR = new THREE.Mesh( doorGeometry, this.doorMaterial );

		doorL.position.set( doorWidth/4, -0.05, doorHeight/2 );
		doorR.position.set( doorWidth/4,  0.05, doorHeight/2 );

		this.doorLPivot.add( doorL );
		this.doorRPivot.add( doorR );

		//
		// Create door frames
		//
		var vFrameGeometry = new THREE.BoxGeometry( doorFrame, doorFrame, doorHeight+doorFrame );
		var hFrameGeometry = new THREE.BoxGeometry( doorWidth+2*doorFrame, doorFrame, doorFrame );
		var lFrame = new THREE.Mesh( vFrameGeometry, this.doorFrameMaterial );
		var rFrame = new THREE.Mesh( vFrameGeometry, this.doorFrameMaterial );
		var tFrame = new THREE.Mesh( hFrameGeometry, this.doorFrameMaterial );

		lFrame.position.set( -doorWidth/2-doorFrame/2, length, doorHeight/2 );
		rFrame.position.set(  doorWidth/2+doorFrame/2, length, doorHeight/2 );
		tFrame.position.set(  0, length, doorHeight );

		this.add( lFrame );
		this.add( rFrame );
		this.add( tFrame );

	},

	addPillars: function( x,y,height,spacing,repeats ) {
		var z = 0, step = height + spacing;
		for (var i=0; i<repeats; i++, z += step) {
			this.addPillar(x,y,z,height);
		}
	},

	addPillar: function( x,y,z,height ) {

		// Remove height of kionokrano
		height -= 0.4;

		//
		// Pillar
		//
		var geom = new THREE.CylinderBufferGeometry( 0.25, 0.4, height, 12, 1 );
		var mesh = new THREE.Mesh( geom, this.pillarMaterial );

		mesh.position.set( x, y, z+height/2 );
		mesh.rotation.set( Math.PI/2, 0, 0 );
		mesh.castShadow = true;
		this.add( mesh );

		//
		// Kionokrano
		//
		var mesh = this.kionokranoMesh.children[0].clone();
		mesh.material = this.kionokranoMaterial;
		mesh.position.set( x,y,z+height );
		mesh.castShadow = true;
		this.add( mesh );

	},

	addJunctionFrames: function( length, width, padding, step, frameHeight, repeats ) {
		var z = step;
		for (var i=0; i<repeats; i++, z+=step) {
			this.addJunctionFrame( length, width, z, padding, frameHeight );
		}
	},

	addJunctionFrame: function( length, width, z, padding, frameHeight ) {
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

	},

	openDoor: function( cb ) {
		Iconeezin.Runtime.runTween((function(i) {

			this.doorLPivot.rotation.set( 0, 0, (-Math.PI/2)*i );
			this.doorRPivot.rotation.set( 0, 0, -Math.PI+(Math.PI/2)*i );

		}).bind(this), 1000, cb);
	},

});

module.exports = MonumentRoom;
