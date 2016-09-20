var THREE = require('three');
var Iconeezin = require('iconeezin');

var Objects = function( db ) {

  ////////////////////////////////////////
  // Tree 01
  ////////////////////////////////////////

  var birch01_leaf_map = Iconeezin.Util.createTexture(db['introduction/textures/plants/birch/leaf/diffuse']);
  var birch01_leaf_nrm = Iconeezin.Util.createTexture(db['introduction/textures/plants/birch/leaf/normal']);

  var birch01_bark_map = Iconeezin.Util.createTexture(db['introduction/textures/plants/birch/bark/diffuse']);
  var birch01_bark_nrm = Iconeezin.Util.createTexture(db['introduction/textures/plants/birch/bark/normal']);

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
    var obj = db['introduction/models/plants/birch'].clone();

    obj.children[0].material = birch01_leaf;
    obj.children[0].customDepthMaterial = birch01_depth_leaf;
    obj.children[0].castShadow = true;
    // obj.children[0].renderOrder = 60;

    obj.children[1].material = birch_01_bark;
    obj.children[1].castShadow = true;
    // obj.children[0].renderOrder = 0.1;

    obj.scale.x = obj.scale.y = obj.scale.z = 0.2 + Math.random()*0.2;
    obj.rotation.z = Math.random() * Math.PI;

    return obj;
  }

  ////////////////////////////////////////
  // Poster 01
  ////////////////////////////////////////

  this.createPoster = function(texture) {
    var obj = db['introduction/models/frame'].clone();
    obj.scale.multiplyScalar(1.5);

    obj.children[0].material = new THREE.MeshBasicMaterial({
      map: Iconeezin.Util.createTexture(texture)
    });

    // obj.children[0].material = birch01_leaf;
    // obj.children[0].customDepthMaterial = birch01_depth_leaf;
    // obj.children[0].castShadow = true;
    // // obj.children[0].renderOrder = 60;

    // obj.children[1].material = birch_01_bark;
    // obj.children[1].castShadow = true;
    // // obj.children[0].renderOrder = 0.1;

    // obj.scale.x = obj.scale.y = obj.scale.z = 0.5 + Math.random()*1.0;
    // obj.rotation.z = Math.random() * Math.PI;

    return obj;
  }

};

module.exports = Objects;
