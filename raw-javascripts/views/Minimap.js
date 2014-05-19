var config;

require('config');

config = moduleLibrary.get('config');

moduleLibrary.define('Minimap.View', gamecore.Pooled.extend('MinimapView', {
  create: function(tileMapModel, entityManagerView, viewportModel) {
    var minimapView;
    minimapView = this._super();
    minimapView.viewportModel = viewportModel;
    minimapView.lastUpdate = 0;
    minimapView.scrollX = 0;
    minimapView.scrollY = 0;
    minimapView.el = new createjs.Container;
    minimapView.el.x = config.tileWidth;
    minimapView.el.y = config.tileHeight;
    minimapView.el.shadow = new createjs.Shadow('rgba(0, 0, 0, 0.6)', 1, 1, 0);
    minimapView.terrainEl = new createjs.Shape;
    this.buildTileViews(minimapView, tileMapModel);
    minimapView.el.addChild(minimapView.terrainEl);
    minimapView.entityManagerView = entityManagerView;
    minimapView.entityEl = new createjs.Shape;
    minimapView.el.addChild(minimapView.entityEl);
    minimapView.overlayEl = new createjs.Shape;
    minimapView.el.addChild(minimapView.overlayEl);
    _.bindAll(minimapView, 'onClick');
    minimapView.el.addEventListener('mousedown', minimapView.onClick);
    minimapView.buildEntityViews();
    minimapView.drawOverlayView();
    EventBus.addEventListener("!move:" + viewportModel.uniqueId, minimapView.drawOverlayView, minimapView);
    EventBus.addEventListener("!scroll:" + viewportModel.uniqueId, minimapView.setScroll, minimapView);
    return minimapView;
  },
  buildTileViews: function(minimapView, tileMapModel) {
    var color, minimapHeight, minimapWidth, tileHeight, tileValue, tileValues, tileWidth, tileX, tileY, x, y, _i, _j, _ref, _ref1;
    tileValues = tileMapModel.getArea(config.worldTileWidth, config.worldTileHeight, Math.floor(config.worldTileWidth / 2), Math.floor(config.worldTileHeight / 2));
    tileWidth = config.minimapOptions.tileWidth;
    tileHeight = config.minimapOptions.tileHeight;
    for (y = _i = 0, _ref = tileValues.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
      for (x = _j = 0, _ref1 = tileValues[y].length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
        tileValue = tileValues[y][x];
        color = tileValue !== 0 ? '#00ff00' : '#0000ff';
        tileX = x * config.minimapOptions.tileWidth;
        tileY = y * config.minimapOptions.tileHeight;
        minimapView.terrainEl.graphics.beginFill(color).drawRect(tileX, tileY, tileWidth, tileHeight);
      }
    }
    minimapWidth = config.minimapOptions.tileWidth * config.worldTileWidth;
    minimapHeight = config.minimapOptions.tileHeight * config.worldTileHeight;
    return minimapView.terrainEl.cache(0, 0, minimapWidth, minimapHeight);
  }
}, {
  buildEntityViews: function() {
    var el, entityModel, entityModels, entityX, entityY, minimapHeight, minimapWidth, tileHeight, tileWidth, _i, _len;
    entityModels = this.entityManagerView.entityModels;
    el = this.entityEl;
    el.graphics.clear();
    tileWidth = config.minimapOptions.tileWidth;
    tileHeight = config.minimapOptions.tileHeight;
    minimapWidth = config.minimapOptions.tileWidth * config.worldTileWidth;
    minimapHeight = config.minimapOptions.tileHeight * config.worldTileHeight;
    for (_i = 0, _len = entityModels.length; _i < _len; _i++) {
      entityModel = entityModels[_i];
      entityX = entityModel.x * tileWidth;
      entityY = entityModel.y * tileHeight;
      el.graphics.beginFill(entityModel.minimapColor).drawCircle(entityX, entityY, tileWidth);
    }
    return el.cache(0, 0, minimapWidth, minimapHeight);
  },
  setScroll: function() {
    this.scrollX = this.viewportModel.scrollX * (config.minimapOptions.tileWidth / config.tileWidth);
    this.scrollY = this.viewportModel.scrollY * (config.minimapOptions.tileHeight / config.tileHeight);
    return this.drawOverlayView();
  },
  drawOverlayView: function() {
    var el, g, h, halfHeight, halfWidth, height, w, width, x, y;
    el = this.overlayEl;
    width = config.viewportOptions.width * config.minimapOptions.tileWidth;
    height = config.viewportOptions.height * config.minimapOptions.tileHeight;
    halfWidth = Math.floor(width / 2);
    halfHeight = Math.floor(height / 2);
    x = (this.viewportModel.x * config.minimapOptions.tileWidth) - halfWidth;
    y = (this.viewportModel.y * config.minimapOptions.tileHeight) - halfHeight;
    x -= this.scrollX;
    y -= this.scrollY;
    w = config.worldTileWidth * config.minimapOptions.tileWidth;
    h = config.worldTileHeight * config.minimapOptions.tileHeight;
    el.shadow = new createjs.Shadow('#000000', 1, 1, 0);
    g = el.graphics;
    g.clear();
    g.setStrokeStyle(2, 'square');
    g.beginStroke('rgba(255, 255, 0, 0.6)');
    g.drawRect(x, y, width, height);
    g.drawRect(x - w, y, width, height);
    g.drawRect(x - w, y - h, width, height);
    g.drawRect(x + w, y, width, height);
    g.drawRect(x + w, y - h, width, height);
    g.drawRect(x + w, y + h, width, height);
    g.drawRect(x - w, y + h, width, height);
    g.drawRect(x, y + h, width, height);
    g.drawRect(x, y - h, width, height);
    return el.cache(0, 0, w, h);
  },
  onTick: function(event) {
    var timeDelta;
    timeDelta = event.time - this.lastUpdate;
    if (Math.floor(timeDelta / 500) >= 1) {
      this.buildEntityViews();
      return this.lastUpdate = event.time;
    }
  },
  onClick: function(event) {
    var x, y;
    x = Math.floor((event.stageX - this.el.x) / config.minimapOptions.tileWidth);
    y = Math.floor((event.stageY - this.el.y) / config.minimapOptions.tileHeight);
    return this.viewportModel.setPosition(x, y);
  },
  dispose: function() {
    this.el.removeEventListener('click', this.onClick);
    return this.release();
  }
}));
