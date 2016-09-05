
var THREE = require('three');

/**
 * An infinite sea world being procedurally generated
 */
var InfiniteGround = function(config) {
  THREE.Object3D.call(this);
  var config = config || {};
  var fogDistance = config.fogDistance || 200;
  var depth = config.depth || 50;
  this.speed = config.speed || 1; // Units per second
  this.objects = config.objects;
  this.db = config.db;
  this.planeSize = fogDistance;

  this.dynamic = new THREE.Object3D();
  this.static = new THREE.Object3D();
  this.add(this.dynamic);
  this.add(this.static);

  this.groundMap = new THREE.Texture(this.db['compression/textures/ground/grass_map'],
    THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping);
  this.groundNormalMap = new THREE.Texture(this.db['compression/textures/ground/grass_nrm'],
    THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping);

  this.groundMap.repeat = this.groundNormalMap.repeat = new THREE.Vector2(fogDistance/6, fogDistance/6);
  this.groundMap.needsUpdate = this.groundNormalMap.needsUpdate = true;
  this.groundMap.anisotropy = this.groundNormalMap.anisotropy = 16;
  this.groundMap.magFilter = this.groundNormalMap.magFilter = THREE.NearestFilter;
  this.groundMap.minFilter = this.groundNormalMap.minFilter = THREE.LinearMipMapLinearFilter;

  // Create a plane geomtry up to the extends of the map, used both by
  // sea level and sea floor
  this.planeGeometry = new THREE.PlaneGeometry(this.planeSize, this.planeSize, 1, 1);

  this.seaLevelTexture = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: this.groundMap,
    normalMap: this.groundNormalMap,
    side: THREE.DoubleSide
  });
  this.seaFloorTexture = new THREE.MeshPhongMaterial({ color: 0xffffff,
    side: THREE.DoubleSide
  });

  this.seaLevel = new THREE.Mesh(this.planeGeometry, this.seaLevelTexture);
  this.seaFloor = new THREE.Mesh(this.planeGeometry, this.seaLevelTexture);
  this.static.add(this.seaLevel);
  this.static.add(this.seaFloor);

  this.seaLevel.receiveShadow = true;

  this.seaFloor.position.z = -depth;

  var corridorWidth = 20;
  var treeWidth = 40;
  var plantOverlap = 5;

  var treeZones = [
    [ -corridorWidth/2-treeWidth, -corridorWidth/2 ],
    [ corridorWidth/2 , corridorWidth/2+treeWidth ]
  ];

  var plantZones = [
    [ -corridorWidth/2-plantOverlap, -corridorWidth/2+plantOverlap ],
    [  corridorWidth/2-plantOverlap,  corridorWidth/2+plantOverlap ]
  ];

  for (var i=0; i<50; i++) {
    var p = Math.random() >= 0.5 ? this.objects.createTree02() : this.objects.createTree01();
    var z = Math.random() >= 0.5 ? 1 : 0;

    p.position.set(
        treeZones[z][0] + (treeZones[z][1] - treeZones[z][0]) * Math.random(),
        fogDistance * Math.random() - fogDistance / 2,
        0
      );

    this.dynamic.add(p);
  }

  for (var i=0; i<400; i++) {
    var p = this.objects.createPlant01();
    var z = Math.random() >= 0.5 ? 1 : 0;

    p.position.set(
        treeZones[z][0] + (treeZones[z][1] - treeZones[z][0]) * Math.random(),
        fogDistance * Math.random() - fogDistance / 2,
        0
      );

    this.dynamic.add(p);
  }


};

InfiniteGround.prototype = Object.create(THREE.Object3D.prototype);

InfiniteGround.prototype.update = function(delta, eyeDirection) {
  var displaceVector = eyeDirection.clone().multiplyScalar(delta * this.speed / 1000).negate();
  displaceVector.z = 0;

  // Move dynamic sets
  this.dynamic.position.add( displaceVector );
  // this.static.position.z += displaceVector.z;

  // Fake ground movement by offseting the ground textures
  this.groundMap.offset.set(
      this.groundMap.offset.x - displaceVector.x * this.groundMap.repeat.x / this.planeSize,
      this.groundMap.offset.y - displaceVector.y * this.groundMap.repeat.y / this.planeSize
    );
  this.groundNormalMap.offset.set(
      this.groundNormalMap.offset.x - displaceVector.x * this.groundMap.repeat.x / this.planeSize,
      this.groundNormalMap.offset.y - displaceVector.y * this.groundMap.repeat.y / this.planeSize
    );
};

module.exports = InfiniteGround;
