
var MixController = function(sources) {
  this.sources = sources;
}

MixController.prototype.setMixLevel = function(level) {
  if (this.sources.length === 0) return;
  if (this.sources.length === 1) {
    this.sources[0].setVolume(level);
  } else {

  }
};

module.exports = {
  MixController: MixController
};
