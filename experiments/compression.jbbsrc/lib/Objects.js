var THREE = require('three');

var ShadowShader = {

  fragment: [
    '#include <packing>',
    'uniform sampler2D texture;',
    'varying vec2 vUV;',
    'void main() {',
      'vec4 pixel = texture2D( texture, vUV );',
      'if ( pixel.a < 0.5 ) discard;',
      'gl_FragData[ 0 ] = packDepthToRGBA( gl_FragCoord.z );',
    '}'
  ].join('\n'),

  vertex: [
    'varying vec2 vUV;',
    'void main() {',
      'vUV = 0.75 * uv;',
      'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
      'gl_Position = projectionMatrix * mvPosition;',
    '}'
  ].join('\n')

};

function createShadowMaterial(forTexture) {
  return new THREE.ShaderMaterial( {
    uniforms: {
      texture:  { value: forTexture }
    },
    vertexShader: ShadowShader.vertex,
    fragmentShader: ShadowShader.fragment,
    side: THREE.DoubleSide
  });
}

var Objects = function(db) {

  ////////////////////////////////////////////////
  // Plant 01
  ////////////////////////////////////////////////

  var plant01_Texture = new THREE.Texture(db['compression/textures/grass_01']);
  plant01_Texture.needsUpdate = true;

  var plant01_Material = new THREE.MeshLambertMaterial({
    map: plant01_Texture,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.1,
    // depthTest: false
  });

  var plant01_DepthMaterial = createShadowMaterial(plant01_Texture);

  this.createPlant01 = function() {
    var obj = db['compression/geometries/grass_01'].children[0].clone();
    obj.material = plant01_Material;
    obj.customDepthMaterial = plant01_DepthMaterial;
    obj.castShadow = true;
    obj.scale.x = obj.scale.y = obj.scale.z = 0.7 + Math.random()*0.4;
    obj.rotation.z = Math.random() * Math.PI;
    // obj.renderOrder = 60;
    return obj;
  };

  ////////////////////////////////////////////////
  // Tree 01
  ////////////////////////////////////////////////

  var birch01_leaf_map = new THREE.Texture(db['compression/textures/birch_01/leaves_map']);
  birch01_leaf_map.needsUpdate = true;
  var birch01_leaf_nrm = new THREE.Texture(db['compression/textures/birch_01/leaves_nrm']);
  birch01_leaf_nrm.needsUpdate = true;

  var birch01_bark_map = new THREE.Texture(db['compression/textures/birch_01/bark_map']);
  birch01_bark_map.needsUpdate = true;
  var birch01_bark_nrm = new THREE.Texture(db['compression/textures/birch_01/bark_nrm']);
  birch01_bark_nrm.needsUpdate = true;

  birch01_bark_map.wrapS = birch01_bark_nrm.wrapS = THREE.RepeatWrapping;
  birch01_bark_map.wrapT = birch01_bark_nrm.wrapT = THREE.RepeatWrapping;

  var birch01_leaf = new THREE.MeshPhongMaterial({
    map: birch01_leaf_map,
    normalMap: birch01_leaf_nrm,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.1,
    // depthTest: false
  });

  var birch_01_bark = new THREE.MeshPhongMaterial({
    map: birch01_bark_map,
    normalMap: birch01_bark_nrm,
  });

  var birch01_depth_leaf = createShadowMaterial(birch01_leaf_map);

  this.createTree01 = function() {
    var obj = db['compression/geometries/birch_01'].clone();
    console.log(obj);

    obj.children[0].material = birch01_leaf;
    obj.children[0].customDepthMaterial = birch01_depth_leaf;
    obj.children[0].castShadow = true;
    // obj.children[0].renderOrder = 60;

    obj.children[1].material = birch_01_bark;
    obj.children[1].castShadow = true;
    // obj.children[0].renderOrder = 0.1;

    obj.scale.x = obj.scale.y = obj.scale.z = 0.5 + Math.random()*1.0;
    obj.rotation.z = Math.random() * Math.PI;

    return obj;
  }

  ////////////////////////////////////////////////
  // Tree 02
  ////////////////////////////////////////////////

  var tree02_board_map = new THREE.Texture(db['compression/textures/tree_02/board_map']);
  tree02_board_map.needsUpdate = true;
  var tree02_board_nrm = new THREE.Texture(db['compression/textures/tree_02/board_nrm']);
  tree02_board_nrm.needsUpdate = true;

  var tree02_con_map = new THREE.Texture(db['compression/textures/tree_02/con_map']);
  tree02_con_map.needsUpdate = true;
  var tree02_con_nrm = new THREE.Texture(db['compression/textures/tree_02/con_nrm']);
  tree02_con_nrm.needsUpdate = true;

  var tree02_bark_map = new THREE.Texture(db['compression/textures/tree_02/bark_map']);
  tree02_bark_map.needsUpdate = true;
  var tree02_bark_nrm = new THREE.Texture(db['compression/textures/tree_02/bark_nrm']);
  tree02_bark_nrm.needsUpdate = true;

  tree02_bark_map.wrapS = tree02_bark_nrm.wrapS = THREE.RepeatWrapping;
  tree02_bark_map.wrapT = tree02_bark_nrm.wrapT = THREE.RepeatWrapping;

  var tree02_board = new THREE.MeshPhongMaterial({
    map: tree02_board_map,
    normalMap: tree02_board_nrm,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.1,
    // depthTest: false
  });

  var tree02_con = new THREE.MeshPhongMaterial({
    map: tree02_con_map,
    normalMap: tree02_con_nrm,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.1,
    // depthTest: false
  });

  var tree02_bark = new THREE.MeshPhongMaterial({
    map: tree02_bark_map,
    normalMap: tree02_bark_nrm,
  });

  var tree02_depth_board = createShadowMaterial(tree02_board_map);
  var tree02_depth_con = createShadowMaterial(tree02_con_map);

  this.createTree02 = function() {
    var obj = db['compression/geometries/tree_02'].clone();
    console.log(obj);

    obj.children[0].material = tree02_board;
    obj.children[0].customDepthMaterial = tree02_depth_board;
    obj.children[0].castShadow = true;
    // obj.children[0].renderOrder = 60;

    obj.children[1].material = tree02_con;
    obj.children[1].customDepthMaterial = tree02_depth_con;
    obj.children[1].castShadow = true;
    // obj.children[0].renderOrder = 0.5;

    obj.children[2].material = tree02_bark;
    obj.children[2].castShadow = true;
    // obj.children[0].renderOrder = 0.1;

    obj.scale.x = obj.scale.y = obj.scale.z = 0.5 + Math.random()*1.0;
    obj.rotation.z = Math.random() * Math.PI;

    return obj;
  }

};

module.exports = Objects;
