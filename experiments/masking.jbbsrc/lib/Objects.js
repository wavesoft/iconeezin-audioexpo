var THREE = require('three');
var Iconeezin = require('iconeezin');

var Objects = function(db) {

  ////////////////////////////////////////////////
  // Plant 01
  ////////////////////////////////////////////////

  var plant01_Texture = Iconeezin.Util.createTexture(db['masking/textures/grass_01']);

  var plant01_Material = new THREE.MeshLambertMaterial({
    map: plant01_Texture,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.1,
    // depthTest: false
  });

  var plant01_DepthMaterial = Iconeezin.Util.createShadowMaterial(plant01_Texture);

  this.createPlant01 = function() {
    var obj = db['masking/geometries/grass_01'].children[0].clone();
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

  var birch01_leaf_map = Iconeezin.Util.createTexture(db['masking/textures/birch_01/leaves_map']);
  var birch01_leaf_nrm = Iconeezin.Util.createTexture(db['masking/textures/birch_01/leaves_nrm']);

  var birch01_bark_map = Iconeezin.Util.createTexture(db['masking/textures/birch_01/bark_map']);
  var birch01_bark_nrm = Iconeezin.Util.createTexture(db['masking/textures/birch_01/bark_nrm']);

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

  var birch01_depth_leaf = Iconeezin.Util.createShadowMaterial(birch01_leaf_map);

  this.createTree01 = function() {
    var obj = db['masking/geometries/birch_01'].clone();

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

  var tree02_board_map = Iconeezin.Util.createTexture(db['masking/textures/tree_02/board_map']);
  var tree02_board_nrm = Iconeezin.Util.createTexture(db['masking/textures/tree_02/board_nrm']);

  var tree02_con_map = Iconeezin.Util.createTexture(db['masking/textures/tree_02/con_map']);
  var tree02_con_nrm = Iconeezin.Util.createTexture(db['masking/textures/tree_02/con_nrm']);

  var tree02_bark_map = Iconeezin.Util.createTexture(db['masking/textures/tree_02/bark_map']);
  var tree02_bark_nrm = Iconeezin.Util.createTexture(db['masking/textures/tree_02/bark_nrm']);

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

  var tree02_depth_board = Iconeezin.Util.createShadowMaterial(tree02_board_map);
  var tree02_depth_con = Iconeezin.Util.createShadowMaterial(tree02_con_map);

  this.createTree02 = function() {
    var obj = db['masking/geometries/tree_02'].clone();

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

  ////////////////////////////////////////////////
  // Sparrow
  ////////////////////////////////////////////////

  var sparrow_map = Iconeezin.Util.createTexture(db['masking/textures/sparrow']);
  var sparrow = new THREE.MeshBasicMaterial({
    map: sparrow_map,
    transparent: true,
    morphTargets: true
  });

  var sparrow_depth = Iconeezin.Util.createShadowMaterial(sparrow);

  var sparrow_geom = db['masking/geometries/sparrow'];
  sparrow_geom.computeMorphNormals();

  this.createSparrow = function() {
    var obj = new THREE.Mesh( sparrow_geom, sparrow );
    obj.castShadow = true;
    obj.scale.multiplyScalar( 0.25 );

    var mixer = Iconeezin.Runtime.Video.getAnimationMixer( obj );
    var clip = THREE.AnimationClip.CreateFromMorphTargetSequence(
      'fly', sparrow_geom.morphTargets, 50
    );
    var action = mixer.clipAction( clip ).setDuration( 1 );
    action.time = Math.random();
    action.play();

    return obj;
  }

};

module.exports = Objects;
