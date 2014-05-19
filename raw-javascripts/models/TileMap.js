var config, utils;

require('utils');

require('config');

utils = moduleLibrary.get('utils');

config = moduleLibrary.get('config');

moduleLibrary.define('TileMap.Model', gamecore.Pooled.extend('TileMapModel', {
  create: function(tileSourceModelLocation, tileSourceModelName, tileSourceModelOptions, seed) {
    var tileMapModel;
    tileMapModel = this._super();
    tileMapModel.tileCache = [];
    require(tileSourceModelLocation);
    tileMapModel.tileSourceModel = new (moduleLibrary.get(tileSourceModelName))(seed, tileSourceModelOptions);
    return tileMapModel;
  }
}, {
  getArea: function(sliceWidth, sliceHeight, centerX, centerY) {
    var data, worldX, worldY, x, xOffset, y, yOffset, _i, _j, _ref, _ref1;
    data = [];
    xOffset = Math.floor(sliceWidth / 2);
    yOffset = Math.floor(sliceHeight / 2);
    for (y = _i = 0, _ref = sliceHeight - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
      data[y] = [];
      for (x = _j = 0, _ref1 = sliceWidth - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
        worldX = utils.clamp(x - xOffset + centerX, config.worldTileWidth);
        worldY = utils.clamp(y - yOffset + centerY, config.worldTileHeight);
        data[y][x] = this.getTile(worldX, worldY);
      }
    }
    return data;
  },
  findPath: function(startX, startY, endX, endY, sliceWidth, sliceHeight) {
    var deltaX, deltaY, end, grid, index, lastStep, path, pathOut, pathStep, start, targetX, targetY, worldHalfHeight, worldHalfWidth, _i, _len;
    grid = this.getPathfindingArea(sliceWidth, sliceHeight, startX, startY);
    worldHalfWidth = Math.ceil(sliceWidth / 2);
    worldHalfHeight = Math.ceil(sliceHeight / 2);
    deltaX = startX - worldHalfWidth;
    deltaY = startY - worldHalfHeight;
    targetX = utils.clamp(endX - deltaX, config.worldTileWidth);
    targetY = utils.clamp(endY - deltaY, config.worldTileHeight);
    start = [worldHalfWidth, worldHalfHeight];
    end = [targetX, targetY];
    path = AStar(grid, start, end);
    if (path.length === 0) {
      return [];
    }
    pathOut = [];
    for (index = _i = 0, _len = path.length; _i < _len; index = ++_i) {
      pathStep = path[index];
      if (index === 0) {
        continue;
      } else {
        lastStep = path[index - 1];
        pathOut.push([pathStep[0] - lastStep[0], pathStep[1] - lastStep[1]]);
      }
    }
    pathOut.push([0, 0]);
    return pathOut;
  },
  getPathfindingArea: function(sliceWidth, sliceHeight, centerX, centerY) {
    var data, tileGrid, tileGridItem, tileGridRow, x, y, _i, _j, _len, _len1;
    tileGrid = this.getArea(sliceWidth, sliceHeight, centerX, centerY);
    data = [];
    for (y = _i = 0, _len = tileGrid.length; _i < _len; y = ++_i) {
      tileGridRow = tileGrid[y];
      data[y] = [];
      for (x = _j = 0, _len1 = tileGridRow.length; _j < _len1; x = ++_j) {
        tileGridItem = tileGridRow[x];
        data[y][x] = +(tileGridItem === 0);
      }
    }
    return data;
  },
  getCell: function(worldX, worldY) {
    return this.tileSourceModel.getCell(worldX, worldY);
  },
  getTile: function(worldX, worldY) {
    var cell, index, neighbors, _base;
    if (this.tileCache[worldY] && (this.tileCache[worldY][worldX] != null)) {
      return this.tileCache[worldY][worldX];
    }
    cell = this.tileSourceModel.getCell(worldX, worldY);
    neighbors = this.collectNeighbors(worldX, worldY);
    index = this.getIndexByNeighbors(cell, neighbors);
    if ((_base = this.tileCache)[worldY] == null) {
      _base[worldY] = [];
    }
    return this.tileCache[worldY][worldX] = index;
  },
  collectNeighbors: function(worldX, worldY) {
    var cx, cy, e, n, ne, nw, s, se, sw, w, xl, yl;
    xl = config.worldTileWidth;
    yl = config.worldTileHeight;
    cx = function(ox) {
      return utils.clamp(ox, xl);
    };
    cy = function(oy) {
      return utils.clamp(oy, yl);
    };
    n = this.tileSourceModel.getCell(cx(worldX - 0), cy(worldY - 1));
    e = this.tileSourceModel.getCell(cx(worldX + 1), cy(worldY - 0));
    s = this.tileSourceModel.getCell(cx(worldX - 0), cy(worldY + 1));
    w = this.tileSourceModel.getCell(cx(worldX - 1), cy(worldY - 0));
    ne = this.tileSourceModel.getCell(cx(worldX + 1), cy(worldY - 1));
    se = this.tileSourceModel.getCell(cx(worldX + 1), cy(worldY + 1));
    sw = this.tileSourceModel.getCell(cx(worldX - 1), cy(worldY + 1));
    nw = this.tileSourceModel.getCell(cx(worldX - 1), cy(worldY - 1));
    return [n, e, s, w, ne, se, sw, nw];
  },
  cacheAllTiles: function() {
    return this.tileSourceModel.cacheAllTiles();
  },
  getIndexByNeighbors: function(tileValue, neighbors) {
    var a, b, c, d, e, f, g, h, index, n, ne, nw, s, se, sw, w;
    index = 0;
    n = neighbors[0];
    e = neighbors[1];
    s = neighbors[2];
    w = neighbors[3];
    ne = neighbors[4];
    se = neighbors[5];
    sw = neighbors[6];
    nw = neighbors[7];
    if (tileValue) {
      a = n << n * 4;
      b = e << e * 5;
      c = s << s * 6;
      d = w << w * 7;
      e = ne << ne * 0;
      f = se << se * 1;
      g = nw << nw * 3;
      h = sw << sw * 2;
      index = a + b + c + d + e + f + g + h;
    }
    return index;
  },
  dispose: function() {
    this.tileSourceModel = void 0;
    return this.release();
  }
}));
