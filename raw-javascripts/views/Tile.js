var config, utils;

require('utils');

require('config');

utils = moduleLibrary.get('utils');

config = moduleLibrary.get('config');

moduleLibrary.define('Tile.View', gamecore.Pooled.extend('TileView', {
  create: function(tileModel) {
    var tileView;
    tileView = this._super();
    tileView.model = tileModel;
    tileView.el = new createjs.Bitmap(utils.tilesetImg);
    tileView.model.setIndexCallback(function() {
      return tileView.setTileIndex();
    });
    tileView.setTileIndex();
    return tileView;
  }
}, {
  setTileIndex: function() {
    var th, tileIndex, tw, x, y;
    tileIndex = this.model.tileIndex;
    x = tileIndex % 16;
    y = Math.floor(tileIndex / 16);
    tw = config.tileWidth;
    th = config.tileHeight;
    return this.el.sourceRect = new createjs.Rectangle(x * tw, y * th, tw, th);
  },
  dispose: function() {
    return this.release();
  }
}));
