window.require.register("views/Viewport", function(require, module) {var config, utils;

require('views/Tile');

require('models/Tile');

require('config');

require('utils');

config = moduleLibrary.get('config');

utils = moduleLibrary.get('utils');

moduleLibrary.define('Viewport.View', gamecore.Pooled.extend('ViewportView', {
  create: function(viewportModel, tileMapModel) {
    var clientHeight, clientWidth, contentHeight, contentWidth, scroller, tileView, viewportView, _i, _len, _ref;
    viewportView = this._super();
    _.bindAll(viewportView, 'onClick', 'scrollerRender');
    viewportView.el = new createjs.Container;
    viewportView.model = viewportModel;
    viewportView.tileMapModel = tileMapModel;
    viewportView.tileModels = this.buildTileModels(viewportView);
    viewportView.tileViews = this.buildTileViews(viewportView);
    _ref = viewportView.tileViews;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tileView = _ref[_i];
      viewportView.el.addChild(tileView.el);
    }
    viewportModel = viewportView.model;
    clientWidth = viewportModel.width * config.tileWidth;
    clientHeight = viewportModel.height * config.tileHeight;
    contentWidth = viewportModel.width * config.tileWidth * 3;
    contentHeight = viewportModel.height * config.tileHeight * 3;
    this.buildScroller(viewportView, clientWidth, clientHeight, contentWidth, contentHeight);
    scroller = viewportView.scroller;
    viewportView.scrollX = viewportModel.width * config.tileWidth;
    viewportView.scrollY = viewportModel.height * config.tileHeight;
    scroller.scrollTo(viewportView.scrollX, viewportView.scrollY, false);
    viewportView.indexOffsetX = Math.floor(config.worldTileWidth / 2);
    viewportView.indexOffsetY = Math.floor(config.worldTileHeight / 2);
    viewportView.el.on('mousedown', function(e) {
      return viewportView.scroller.doTouchStart([e.nativeEvent], +(new Date));
    });
    viewportView.el.on('pressmove', function(e) {
      return viewportView.scroller.doTouchMove([e.nativeEvent], +(new Date));
    });
    viewportView.el.on('pressup', function(e) {
      var diffX, diffY, pos;
      scroller = viewportView.scroller;
      scroller.doTouchEnd(+(new Date));
      pos = scroller.getValues();
      diffX = Math.round((viewportView.scrollX - pos.left) / config.tileWidth);
      diffY = Math.round((viewportView.scrollY - pos.top) / config.tileHeight);
      viewportView.indexOffsetX -= diffX;
      viewportView.indexOffsetY -= diffY;
      viewportView.scrollX = viewportModel.width * config.tileWidth;
      viewportView.scrollY = viewportModel.height * config.tileHeight;
      scroller.scrollTo(viewportView.scrollX, viewportView.scrollY);
      return viewportModel.setPosition(viewportView.indexOffsetX, viewportView.indexOffsetY);
    });
    EventBus.addEventListener("!move:" + viewportView.model.uniqueId, viewportView.drawMap, viewportView);
    return viewportView;
  },
  buildTileModels: function(viewportView) {
    var tileMapData, tileMapModel, tileModel, tileModels, viewportModel, x, y, _i, _j, _ref, _ref1;
    tileMapModel = viewportView.tileMapModel;
    viewportModel = viewportView.model;
    tileMapData = tileMapModel.getArea(viewportModel.width * 3, viewportModel.height * 3, viewportModel.x, viewportModel.y);
    tileModels = [];
    for (y = _i = 0, _ref = tileMapData.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
      for (x = _j = 0, _ref1 = tileMapData[y].length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
        tileModel = (moduleLibrary.get('Tile.Model')).create(tileMapData[y][x], x, y);
        tileModels.push(tileModel);
      }
    }
    return tileModels;
  },
  buildTileViews: function(viewportView) {
    var offsetX, offsetY, viewportModel, views;
    views = [];
    viewportModel = viewportView.model;
    offsetX = viewportModel.width * config.tileWidth;
    offsetY = viewportModel.height * config.tileHeight;
    _.each(viewportView.tileModels, function(tileModel) {
      var tileView;
      tileView = (moduleLibrary.get('Tile.View')).create(tileModel);
      tileView.el.x = tileModel.x * config.tileWidth;
      tileView.el.y = tileModel.y * config.tileHeight;
      return views.push(tileView);
    });
    return views;
  },
  buildScroller: function(viewportView, clientWidth, clientHeight, contentWidth, contentHeight) {
    var scroller;
    viewportView.scroller = new Scroller(viewportView.scrollerRender, {
      animating: false,
      locking: false,
      zooming: true
    });
    scroller = viewportView.scroller;
    return scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);
  }
}, {
  scrollerRender: function(x, y, zoom) {
    var scrollX, scrollY;
    this.el.x = 0 - x;
    this.el.y = 0 - y;
    this.indexOffsetX = utils.clamp(this.indexOffsetX, config.worldTileWidth);
    this.indexOffsetY = utils.clamp(this.indexOffsetY, config.worldTileHeight);
    scrollX = this.el.x + this.model.width * config.tileWidth;
    scrollY = this.el.y + this.model.height * config.tileHeight;
    return this.model.setScroll(scrollX, scrollY);
  },
  drawMap: function() {
    var tileMapData, tileModel, x, y, _i, _j, _ref, _ref1;
    tileMapData = this.tileMapModel.getArea(this.model.width * 3, this.model.height * 3, this.model.x, this.model.y);
    for (y = _i = 0, _ref = tileMapData.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
      for (x = _j = 0, _ref1 = tileMapData[y].length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
        tileModel = this.tileModels[x + tileMapData[y].length * y];
        tileModel.setTileIndex(tileMapData[y][x]);
      }
    }
    this.indexOffsetX = this.model.x;
    return this.indexOffsetY = this.model.y;
  },
  onKeyDown: function(_event, args) {
    var vx, vy, x, y;
    x = this.model.x;
    y = this.model.y;
    vx = 0;
    vy = 0;
    switch (args.keyCode) {
      case 37:
        vx = 0 - 1;
        break;
      case 38:
        vy = 0 - 1;
        break;
      case 39:
        vx = 1;
        break;
      case 40:
        vy = 1;
    }
    x = vx + this.model.x;
    y = vy + this.model.y;
    x = utils.clamp(x, config.worldTileWidth);
    y = utils.clamp(y, config.worldTileHeight);
    return this.model.setPosition(x, y);
  },
  onClick: function(event) {
    var halfHeight, halfWidth, newX, newY, x, y;
    x = Math.floor((event.stageX - this.el.x) / config.tileWidth);
    y = Math.floor((event.stageY - this.el.y) / config.tileHeight);
    halfWidth = Math.floor(config.viewportOptions.width / 2);
    halfHeight = Math.floor(config.viewportOptions.height / 2);
    newX = this.model.x + (x - halfWidth);
    newY = this.model.y + (y - halfHeight);
    return this.model.setPosition(newX, newY);
  },
  dispose: function() {
    _.invoke(this.tileModels, 'dispose');
    _.invoke(this.tileViews, 'dispose');
    EventBus.removeEventListener('!key:down', this.onKeyDown, this);
    return this.release();
  }
}));
});
