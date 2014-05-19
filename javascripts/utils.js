window.require.register("utils", function(require, module) {var config;

require('config');

config = moduleLibrary.get('config');

moduleLibrary.define('utils', {
  clamp: function(index, size) {
    return (index + size) % size;
  },
  random: function(seed) {
    return new RNG(seed).uniform();
  },
  sessionRandom: function() {
    var randomVal;
    randomVal = new RNG(config.sessionRandom).uniform();
    config.sessionRandom += 1;
    return randomVal;
  },
  loadImages: function(spriteSheetSource, callback) {
    this.tilesetImg = new Image();
    this.tilesetImg.onload = callback;
    return this.tilesetImg.src = spriteSheetSource;
  }
});
});
