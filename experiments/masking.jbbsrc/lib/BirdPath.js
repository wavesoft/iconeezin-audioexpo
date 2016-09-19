var THREE = require('three');

/**
 * Path calculation information:
 *
 * [ radius, y-position ]
 */
const curvingPoints = [
  [ 40.0, 40.0 ], // Fly away pose
  [ 5.0, 10.0 ],
  [ 3.0, 4.0 ], // Rest pose
  [ 5.0, -1.0 ],
  [ 40.0, -40.0 ], // Hidden pose
];

const z_correction = -1;

const oscillationVector = new THREE.Vector3( 0.0, 0.0, 1.0 );
const up = new THREE.Vector3( 0.0, 1.0, 1.0 ).normalize();
var axis = new THREE.Vector3();

var easeInOutQuad = function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t }

/**
 * Animation manager that moves the `target` object along a 3D Bezier path
 * defined by 3 end points and 2 controlling points.
 *
 * The `angle` is a number between 0 and Math.PI that defines the track of
 * the bird on the skydome.
 */
var BirdPath = function(target, angle) {

  this.target = target;
  this.lastQuaternion = target.quaternion.clone();

  this.oscillatingPhase = Math.random() * Math.PI;
  this.oscillatingSpeed = Math.random() * 0.5 + 0.5;
  this.oscillationQuaternion = new THREE.Quaternion();
  this.oscillation = 0;

  this.speed = 0.25; // Per second
  this.position = 0;
  this.activePath = null;
  this.opacityFadeIn = false;
  this.transitionCallback = null;

  // Generate paths
  if (angle !== undefined) {
    this.setAngle( angle );
  }

};

BirdPath.prototype = {
  constructor: BirdPath,

  setAngle: function(angle) {

    // Generate control points from the curving information
    var points = curvingPoints.map(function(point) {
      var r = point[0], y = point[1];
      return new THREE.Vector3(
          -Math.cos(angle) * r,
          y,
          Math.sin(angle) * r + z_correction
        );
    });

    // Generate paths
    this.pathEnter = new THREE.QuadraticBezierCurve3(
        points[4], points[3], points[2]
      );
    this.pathLeave = new THREE.QuadraticBezierCurve3(
        points[2], points[1], points[0]
      );

    this.target.position.copy(points[4]);

  },

  enter: function( cb ) {
    this.target.visible = true;
    this.activePath = this.pathEnter;
    this.opacityFadeIn = true;
    this.position = 0;
    this.transitionCallback = cb;
  },

  leave: function( cb ) {
    this.target.visible = true;
    this.activePath = this.pathLeave;
    this.opacityFadeIn = false;
    this.position = 0;
    this.transitionCallback = cb;
  },

  update: function(delta) {

    // Update position and quaternion
    if (this.activePath && (this.position < 1.0)) {
      var step = this.speed * delta / 1000;
      if (this.position + step >= 1.0) {
        this.position = 1.0;
      }

      var pos = easeInOutQuad(this.position);

      this.target.position.copy( this.activePath.getPointAt(pos) );
      // var tangent = this.activePath.getTangentAt(pos).normalize();
      // axis.crossVectors( up, tangent ).normalize();
      // var radians = Math.acos( up.dot( tangent ) );
      this.lastQuaternion.setFromAxisAngle( up, Math.PI );

      if (this.opacityFadeIn) {
        this.target.traverse(function(c) {
          if (c.material) c.material.opacity = 1.0 * pos;
        });
      } else {
        this.target.traverse(function(c) {
          if (c.material) c.material.opacity = 1.0 - (1.0 * pos);
        });
      }

      this.position += step;
      if (this.position > 1.0) {
        if (this.transitionCallback) {
          this.transitionCallback();
        }
        this.transitionCallback = null;
      }
    }

    // Update oscillation quaternion
    this.oscillation += this.oscillatingSpeed * delta/1000;
    this.oscillationQuaternion.setFromAxisAngle(
      oscillationVector, Math.sin(this.oscillation + this.oscillatingPhase) * Math.PI/6
    );

    this.target.quaternion.copy( this.lastQuaternion );
    this.target.quaternion.multiply( this.oscillationQuaternion );

  }

};

module.exports = BirdPath;
