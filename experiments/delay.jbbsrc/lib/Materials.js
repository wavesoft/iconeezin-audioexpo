
var THREE = require('three');
var Iconeezin = require('iconeezin');

var Materials = function( db ) {

  //
  // Walls
  //

  var cinderblock_diff = Iconeezin.Util.createTexture(db['delay/textures/cinderblock/diffuse']);
  var cinderblock_norm = Iconeezin.Util.createTexture(db['delay/textures/cinderblock/normal']);

  this.wallsMaterial = new THREE.MeshStandardMaterial({
    map: cinderblock_diff,
    normalMap: cinderblock_norm,
    side: THREE.BackSide,
    roughness: 1.0,
    metalness: 0,
  });

  //
  // Pillars
  //

  var marble_diff = Iconeezin.Util.createTexture(db['delay/textures/marble/diffuse']);
  var pillar_norm = Iconeezin.Util.createTexture(db['delay/textures/pillar/normal']);

  this.pillarMaterial = new THREE.MeshStandardMaterial({
    map: marble_diff,
    normalMap: pillar_norm,
    roughness: 1.0,
    metalness: 0,
  });

  this.kionokranoMaterial = new THREE.MeshStandardMaterial({
    map: marble_diff,
    roughness: 1.0,
    metalness: 0,
  });

  //
  // Ceiling
  //

  var ceiling_norm = Iconeezin.Util.createTexture(db['delay/textures/ceiling/normal']);

  this.ceilingMaterial = new THREE.MeshStandardMaterial({
    map: marble_diff,
    normalMap: ceiling_norm,
    roughness: 1.0,
    metalness: 0,
  });

  //
  // Floor
  //

  var floor_diffuse = Iconeezin.Util.createTexture(db['delay/textures/floor/diffuse']);
  var floor_norm = Iconeezin.Util.createTexture(db['delay/textures/floor/normal']);

  this.floorMaterial = new THREE.MeshStandardMaterial({
    map: floor_diffuse,
    normalMap: floor_norm,
    roughness: 0.15,
    metalness: 0,
  });

  this.frameMaterial = new THREE.MeshStandardMaterial({
    map: marble_diff,
    roughness: 1.0,
    metalness: 0
  });

  this.podiumMaterial = new THREE.MeshNormalMaterial({ });

  //
  // Door
  //

  var door_diffuse = Iconeezin.Util.createTexture(db['delay/textures/door/diffuse']);

  this.doorMaterial = new THREE.MeshStandardMaterial({
    map: door_diffuse,
    roughness: 1.0,
    metalness: 0
  });
  this.doorFrameMaterial = new THREE.MeshStandardMaterial({
    map: marble_diff,
    roughness: 1.0,
    metalness: 0
  });

};

module.exports = Materials;
