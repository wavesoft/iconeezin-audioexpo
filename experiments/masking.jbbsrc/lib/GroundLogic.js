
var GroundLogic = function(plane_size, plane_interval, insertion_interval, reset_y) {
  this.objects_free = [];
  this.objects_staged = [];
  this.plane_size = plane_size;
  this.plane_interval = plane_interval;
  this.insertion_interval = insertion_interval || 1;
  this.reset_y = reset_y || plane_size/2;

  this.y = 0;
  this.x = 0;
  this.lasty = 0;
};

/**
 * Manage this object, fixed on the given X position
 */
GroundLogic.prototype.add = function(object) {
  this.objects_staged.push(object);
};

/**
 * Reap objects outside the visible region
 */
GroundLogic.prototype.reap = function() {
  this.objects_staged = this.objects_staged.reduce((function(keep, object) {
    if (Math.abs(object.position.y) > this.plane_size/2) {
      object.visible = false;
      this.objects_free.push(object);
    } else {
      keep.push(object);
    }
    return keep;
  }).bind(this), []);
}

/**
 * Update arrangement of objects depending of our given y position
 */
GroundLogic.prototype.update = function(x, y) {
  this.y += y;
  this.x += x;

  var norm_y = (this.y / this.plane_size) * Math.PI * 2;
  var density = (1+Math.cos(norm_y / this.plane_interval))/2;

  // Reap objects outside the visible boundaries in order to have some
  // free objects to re-use.
  this.reap();

  // Insert an object depending on the density propability
  if (this.objects_free.length) {
    if (Math.abs(this.lasty - y) > this.insertion_interval) {
      if (density >= Math.random()) {
        var obj = this.objects_free.shift();
        obj.visible = true;
        this.objects_staged.push(obj);

        // Replace to the appropriate edge
        if (obj.position.y < 0) {
          obj.position.y = this.reset_y;
        } else {
          obj.position.y = -this.reset_y;
        }
      }
      this.lasty = y;
    }
  }

  // Forward visible objects
  this.objects_staged.forEach(function(object) {
    object.position.x += x;
    object.position.y += y;
  });

};


module.exports = GroundLogic;
