var THREE = require('three');
var Iconeezin = require('iconeezin');

var Materials = function( db ) {

  //
  // Ground
  //

  var opt = {
    anisotropy: 16,
    minFilter: THREE.NearestFilter,
    maxFilter: THREE.LinearMipMapLinearFilter
  };
  var grass_diff = Iconeezin.Util.createTexture(db['introduction/textures/grassandstone/diffuse'], opt);
  var grass_norm = Iconeezin.Util.createTexture(db['introduction/textures/grassandstone/normal'], opt);

  this.grass = new THREE.MeshStandardMaterial({
    map: grass_diff,
    normalMap: grass_norm,
    roughness: 1.0,
    metalness: 0,
  });

  //
  // Roof
  //

  var roof_norm = Iconeezin.Util.createTexture(db['introduction/textures/tiles/normal']);

  this.roof = new THREE.MeshStandardMaterial({
    color: 0x990000,
    normalMap: roof_norm,
    roughness: 0.5,
    metalness: 0.1,
  });

  //
  // Concrete
  //

  var concrete_diffuse = Iconeezin.Util.createTexture(db['introduction/textures/concrete/diffuse'], {
    repeat: new THREE.Vector2(24, 24)
  });
  var walls_ao = Iconeezin.Util.createTexture(db['introduction/textures/walls/ao'], {
    repeat: new THREE.Vector2(24, 24)
  });
  var pillars_ao = Iconeezin.Util.createTexture(db['introduction/textures/pillars/ao'], {
    repeat: new THREE.Vector2(24, 24)
  });

  this.concrete = new THREE.MeshStandardMaterial({
    map: concrete_diffuse,
    roughness: 1.0,
    metalness: 0.0,
  });

  this.concrete_walls = new THREE.MeshStandardMaterial({
    map: concrete_diffuse,
    aoMap: walls_ao,
    aoIntensity: 0.5,
    roughness: 1.0,
    metalness: 0.0,
  });

  this.concrete_pillars = new THREE.MeshStandardMaterial({
    map: concrete_diffuse,
    aoMap: pillars_ao,
    roughness: 1.0,
    metalness: 0.0,
  });

  //
  // Concrete
  //

  var wood_diffuse = Iconeezin.Util.createTexture(db['introduction/textures/wood/diffuse'], {
    repeat: new THREE.Vector2(24, 24)
  });
  var floor_ao = Iconeezin.Util.createTexture(db['introduction/textures/floor/ao'], {
    repeat: new THREE.Vector2(24, 24)
  });

  this.wood = new THREE.MeshStandardMaterial({
    map: wood_diffuse,
    aoMap: floor_ao,
    roughness: 1.0,
    metalness: 0.0,
  });

};

module.exports = Materials;
