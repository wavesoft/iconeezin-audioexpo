
var THREE = require('three');

/**
 * An infinite sea world being procedurally generated
 */
var InfiniteSea = function(config) {
  THREE.Object3D.call(this);
  var config = config || {};
  var fogDistance = config.fogDistance || 50;
  var depth = config.depth || 50;
  this.speed = config.speed || 1; // Units per second

  this.dynamic = new THREE.Object3D();
  this.static = new THREE.Object3D();
  this.add(this.dynamic);
  this.add(this.static);

  // Create a plane geomtry up to the extends of the map, used both by
  // sea level and sea floor
  this.planeGeometry = new THREE.PlaneGeometry(fogDistance, fogDistance, 1, 1);

  this.seaLevelTexture = new THREE.MeshNormalMaterial({
    side: THREE.DoubleSide
  });
  this.seaFloorTexture = new THREE.MeshNormalMaterial({
    side: THREE.DoubleSide
  });

  this.seaLevel = new THREE.Mesh(this.planeGeometry, this.seaLevelTexture);
  this.seaFloor = new THREE.Mesh(this.planeGeometry, this.seaLevelTexture);
  this.static.add(this.seaLevel);
  this.static.add(this.seaFloor);

  this.seaFloor.position.z = -depth;


  this.box = new THREE.Mesh(
      new THREE.BoxGeometry(2,2,2),
      new THREE.MeshNormalMaterial()
    );
  this.dynamic.add(this.box);
  this.box.position.set(0,10,0);

};

InfiniteSea.prototype = Object.create(THREE.Object3D.prototype);

InfiniteSea.prototype.update = function(delta, eyeDirection) {
  var displaceVector = eyeDirection.clone().multiplyScalar(delta * this.speed / 1000).negate();

  this.dynamic.position.add( displaceVector );
  this.static.position.z += displaceVector.z;

};

module.exports = InfiniteSea;
