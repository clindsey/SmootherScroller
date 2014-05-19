window.require.register("models/Tile", function(require, module) {moduleLibrary.define('Tile.Model', gamecore.Pooled.extend('TileModel', {
  create: function(tileIndex, x, y) {
    var tileModel;
    tileModel = this._super();
    tileModel.tileIndex = tileIndex;
    tileModel.x = x;
    tileModel.y = y;
    return tileModel;
  }
}, {
  setTileIndex: function(newTileIndex) {
    if (this.tileIndex !== newTileIndex) {
      this.tileIndex = newTileIndex;
      return this.onChangeTileIndex();
    }
  },
  setIndexCallback: function(newCallback) {
    return this.onChangeTileIndex = newCallback;
  },
  onChangeTileIndex: function() {},
  dispose: function() {
    return this.release();
  }
}));
});
