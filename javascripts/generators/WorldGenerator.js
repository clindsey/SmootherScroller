window.require.register("generators/WorldGenerator", function(require, module) {var WorldGenerator, utils;

require('utils');

utils = moduleLibrary.get('utils');

moduleLibrary.define('WorldGenerator.Generator', WorldGenerator = (function() {
  function WorldGenerator(seed, options) {
    this.seed = seed;
    this.options = options;
    this.tileCache = [];
    this.chunkCache = [];
  }

  WorldGenerator.prototype.cacheAllTiles = function() {
    var chunk, cx, cy, vx, vy, x, y, _i, _ref, _results;
    _results = [];
    for (y = _i = 0, _ref = this.options.worldChunkHeight - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
      _results.push((function() {
        var _j, _ref1, _results1;
        _results1 = [];
        for (x = _j = 0, _ref1 = this.options.worldChunkWidth - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
          chunk = this.getChunk(x, y);
          _results1.push((function() {
            var _k, _ref2, _results2;
            _results2 = [];
            for (cy = _k = 0, _ref2 = chunk.length - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; cy = 0 <= _ref2 ? ++_k : --_k) {
              _results2.push((function() {
                var _l, _ref3, _results3;
                _results3 = [];
                for (cx = _l = 0, _ref3 = chunk[0].length - 1; 0 <= _ref3 ? _l <= _ref3 : _l >= _ref3; cx = 0 <= _ref3 ? ++_l : --_l) {
                  vx = x * this.options.chunkTileWidth + cx;
                  vy = y * this.options.chunkTileHeight + cy;
                  _results3.push(this.getCell(vx, vy));
                }
                return _results3;
              }).call(this));
            }
            return _results2;
          }).call(this));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  WorldGenerator.prototype.getCell = function(worldX, worldY) {
    var cell, chunk, chunkX, chunkY, worldChunkX, worldChunkY;
    if (this.tileCache[worldY] && (this.tileCache[worldY][worldX] != null)) {
      return this.tileCache[worldY][worldX];
    }
    worldChunkX = Math.floor(worldX / this.options.chunkTileWidth);
    worldChunkY = Math.floor(worldY / this.options.chunkTileHeight);
    chunkX = worldX % this.options.chunkTileWidth;
    chunkY = worldY % this.options.chunkTileHeight;
    chunk = this.getChunk(worldChunkX, worldChunkY);
    cell = +(chunk[chunkY][chunkX] >= this.options.waterCutoff);
    if (this.tileCache[worldY] == null) {
      this.tileCache[worldY] = [];
    }
    this.tileCache[worldY][worldX] = cell;
    return cell;
  };

  WorldGenerator.prototype.getChunk = function(worldChunkX, worldChunkY) {
    var chunkData, chunkTileHeight, chunkTileWidth, ne, nw, se, sw;
    nw = this.chunkEdgeIndex(worldChunkX, worldChunkY);
    ne = this.chunkEdgeIndex(worldChunkX + 1, worldChunkY);
    sw = this.chunkEdgeIndex(worldChunkX, worldChunkY + 1);
    se = this.chunkEdgeIndex(worldChunkX + 1, worldChunkY + 1);
    chunkTileWidth = this.options.chunkTileWidth;
    chunkTileHeight = this.options.chunkTileHeight;
    chunkData = this.bilinearInterpolate(nw, ne, se, sw, chunkTileWidth, chunkTileHeight);
    return chunkData;
  };

  WorldGenerator.prototype.chunkEdgeIndex = function(x, y) {
    var height, seed, width;
    width = this.options.worldChunkWidth;
    height = this.options.worldChunkHeight;
    seed = this.seed;
    x = this.clamp(x, width);
    y = this.clamp(y, height);
    return utils.random(y * width + x + seed);
  };

  WorldGenerator.prototype.bilinearInterpolate = function(nw, ne, se, sw, width, height) {
    var bottomHeight, cellHeight, cells, topHeight, x, xLookup, xStep, y, yStep, _i, _j, _ref, _ref1;
    xLookup = [];
    cells = [];
    for (y = _i = 0, _ref = height - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
      cells[y] = [];
      yStep = y / (height - 1);
      for (x = _j = 0, _ref1 = width - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
        if (xLookup[x] != null) {
          xStep = xLookup[x];
        } else {
          xStep = xLookup[x] = x / (width - 1);
        }
        topHeight = nw + xStep * (ne - nw);
        bottomHeight = sw + xStep * (se - sw);
        cellHeight = topHeight + yStep * (bottomHeight - topHeight);
        cells[y][x] = cellHeight;
      }
    }
    return cells;
  };

  WorldGenerator.prototype.clamp = function(index, size) {
    return (index + size) % size;
  };

  return WorldGenerator;

})());
});
