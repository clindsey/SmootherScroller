window.require.register('config', function(require, module) {
var config;

config = {
  seed: +(new Date),
  sessionRandom: +(new Date),
  fps: 20,
  spriteSheetSource: 'images/tileset.png',
  generator: {
    location: 'generators/WorldGenerator',
    name: 'WorldGenerator.Generator',
    options: {
      waterCutoff: 0.4,
      worldChunkWidth: 8,
      worldChunkHeight: 8,
      chunkTileWidth: 8,
      chunkTileHeight: 8
    }
  },
  tileWidth: 32,
  tileHeight: 32,
  viewportOptions: {
    width: 20,
    height: 15
  },
  minimapOptions: {
    tileWidth: 2,
    tileHeight: 2
  }
};

config.worldTileWidth = config.generator.options.worldChunkWidth * config.generator.options.chunkTileWidth;

config.worldTileHeight = config.generator.options.worldChunkHeight * config.generator.options.chunkTileHeight;

config.canvasAdapterOptions = {
  width: config.viewportOptions.width * config.tileWidth,
  height: config.viewportOptions.height * config.tileHeight
};

moduleLibrary.define('config', config);

});

window.require.register('generators/WorldGenerator', function(require, module) {
var WorldGenerator, utils;

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

window.require.register('index', function(require, module) {

(function() {
  var app, config, utils;
  require('views/CanvasAdapter');
  require('views/Stage');
  require('views/Viewport');
  require('config');
  require('utils');
  utils = moduleLibrary.get('utils');
  config = moduleLibrary.get('config');
  app = {
    onLoad: function() {
      return utils.loadImages(config.spriteSheetSource, app.onImagesLoad);
    },
    onImagesLoad: function() {
      app.canvasAdapterView = (moduleLibrary.get('CanvasAdapter.View')).create(config.canvasAdapterOptions);
      app.stageView = (moduleLibrary.get('Stage.View')).create(app.canvasAdapterView.canvasEl, 'scenes/FoodChain', 'FoodChain.Scene');
      return document.onkeydown = app.onKeyDown;
    },
    onKeyDown: function(event) {
      return EventBus.dispatch('!key:down', this, event);
    },
    dispose: function() {
      document.onkeydown = void 0;
      this.canvasAdapterView.dispose();
      return this.stageView.dispose();
    }
  };
  return app.onLoad();
})();

});

window.require.register('models/Carrot', function(require, module) {

moduleLibrary.define('Carrot.Model', gamecore.Pooled.extend('CarrotModel', {
  create: function(x, y, maturity, maturityCounter) {
    var carrotModel;
    if (maturityCounter == null) {
      maturityCounter = 20;
    }
    carrotModel = this._super();
    carrotModel.x = x;
    carrotModel.y = y;
    carrotModel.marked = false;
    carrotModel.maturity = maturity;
    carrotModel.maturityCounter = maturityCounter;
    carrotModel.minimapColor = ['#b5e565', '#8dd862', '#65cc60', '#3dbf5d'][carrotModel.maturity];
    return carrotModel;
  }
}, {
  tick: function() {
    if (this.maturity === 3) {
      return;
    }
    this.maturityCounter -= 1;
    this.minimapColor = ['#b5e565', '#8dd862', '#65cc60', '#3dbf5d'][this.maturity];
    if (this.maturityCounter < 0) {
      this.maturityCounter = 20;
      return this.maturity += 1;
    }
  },
  dispose: function() {
    return this.release();
  }
}));

});

window.require.register('models/Rabbit', function(require, module) {
var config, utils;

require('utils');

require('config');

utils = moduleLibrary.get('utils');

config = moduleLibrary.get('config');

moduleLibrary.define('Rabbit.Model', gamecore.Pooled.extend('RabbitModel', {
  create: function(x, y, tileMapModel, entityManagerView) {
    var rabbitModel;
    rabbitModel = this._super();
    rabbitModel.x = x;
    rabbitModel.y = y;
    rabbitModel.energy = 15;
    rabbitModel.eatCount = 0;
    rabbitModel.direction = 'South';
    rabbitModel.tileMapModel = tileMapModel;
    rabbitModel.entityManagerView = entityManagerView;
    rabbitModel.minimapColor = '#ff9600';
    rabbitModel.moving = false;
    rabbitModel.stateMachine = this.stateMachine(rabbitModel);
    return rabbitModel;
  },
  stateMachine: function(rabbitModel) {
    return StateMachine.create({
      initial: 'resting',
      events: [
        {
          name: 'work',
          from: 'resting',
          to: 'working'
        }, {
          name: 'work',
          from: 'working',
          to: 'working'
        }, {
          name: 'rest',
          from: 'working',
          to: 'resting'
        }
      ],
      callbacks: {
        onrest: function() {
          var path, result;
          result = rabbitModel.getPathToNearestCarrot();
          path = result.path;
          if (path.length) {
            rabbitModel.path = path;
            rabbitModel.moving = true;
            return rabbitModel.targetCarrot = result.model;
          }
        },
        onwork: function() {
          var ateCarrot;
          ateCarrot = rabbitModel.entityManagerView.removeCarrot(rabbitModel.targetCarrot);
          if (ateCarrot) {
            rabbitModel.energy += 10;
            rabbitModel.eatCount += 1;
            if (rabbitModel.eatCount % 2 === 0) {
              return rabbitModel.entityManagerView.spawnRabbit(rabbitModel);
            }
          }
        }
      }
    });
  }
}, {
  getPathToNearestCarrot: function() {
    var carrotModel, carrotModels, carrotProximityManager, nearestCarrot, path, shortestPath, _i, _len;
    carrotProximityManager = this.entityManagerView.carrotProximityManager;
    carrotModels = carrotProximityManager.getNeighbors(this);
    shortestPath = [];
    nearestCarrot = void 0;
    for (_i = 0, _len = carrotModels.length; _i < _len; _i++) {
      carrotModel = carrotModels[_i];
      if (carrotModel.marked) {
        continue;
      }
      if (carrotModel.maturity < 3) {
        continue;
      }
      path = this.getPath(carrotModel);
      if (path.length > 1) {
        if (shortestPath.length === 0) {
          shortestPath = path;
          nearestCarrot = carrotModel;
        } else if (path.length < shortestPath.length) {
          shortestPath = path;
          nearestCarrot = carrotModel;
        }
      }
    }
    if (nearestCarrot !== void 0) {
      nearestCarrot.marked = true;
    }
    return {
      path: shortestPath,
      model: nearestCarrot
    };
  },
  setPosition: function(x, y) {
    if (x !== this.x || y !== this.y) {
      this.x = x;
      this.y = y;
      return EventBus.dispatch("!move:" + this.uniqueId);
    }
  },
  tick: function() {
    if (this.moving) {
      this.followPath();
    } else {
      switch (this.stateMachine.current) {
        case 'working':
          this.stateMachine.rest();
          break;
        case 'resting':
          if (this.energy < 30) {
            this.stateMachine.work();
          }
      }
    }
    this.energy -= 1;
    if (this.energy < 0) {
      if (this.targetCarrot) {
        this.targetCarrot.marked = false;
      }
      this.targetCarrot = void 0;
      return this.entityManagerView.removeRabbit(this);
    }
  },
  getPath: function(targetModel) {
    var path;
    path = this.tileMapModel.findPath(this.x, this.y, targetModel.x, targetModel.y, 60, 60);
    return path;
  },
  followPath: function() {
    var dX, dY, nearPath, newDirection, newX, newY, path;
    path = this.path;
    nearPath = path.shift();
    this.path = path;
    if (!this.path.length) {
      this.moving = false;
    }
    if (!((nearPath != null) && !!nearPath.length)) {
      return;
    }
    dX = nearPath[0];
    dY = nearPath[1];
    newX = utils.clamp(this.x + dX, config.worldTileWidth);
    newY = utils.clamp(this.y + dY, config.worldTileHeight);
    newDirection = 'South';
    if (dX > 0) {
      this.direction = 'East';
    }
    if (dX < 0) {
      this.direction = 'West';
    }
    if (dY > 0) {
      this.direction = 'South';
    }
    if (dY < 0) {
      this.direction = 'North';
    }
    return this.setPosition(newX, newY);
  },
  dispose: function() {
    return this.release();
  }
}));

});

window.require.register('models/Tile', function(require, module) {

moduleLibrary.define('Tile.Model', gamecore.Pooled.extend('TileModel', {
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

window.require.register('models/TileMap', function(require, module) {
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
    var cell, index, neighbors, _base, _ref;
    if (this.tileCache[worldY] && (this.tileCache[worldY][worldX] != null)) {
      return this.tileCache[worldY][worldX];
    }
    cell = this.tileSourceModel.getCell(worldX, worldY);
    neighbors = this.collectNeighbors(worldX, worldY);
    index = this.getIndexByNeighbors(cell, neighbors);
    if ((_ref = (_base = this.tileCache)[worldY]) == null) {
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

});

window.require.register('models/Viewport', function(require, module) {

moduleLibrary.define('Viewport.Model', gamecore.Pooled.extend('ViewportModel', {
  create: function(x, y, width, height) {
    var viewportModel;
    viewportModel = this._super();
    viewportModel.x = x;
    viewportModel.y = y;
    viewportModel.width = width;
    viewportModel.height = height;
    viewportModel.scrollX = 0;
    viewportModel.scrollY = 0;
    return viewportModel;
  }
}, {
  setPosition: function(x, y) {
    if (y !== this.y || x !== this.x) {
      this.x = x;
      this.y = y;
      return EventBus.dispatch("!move:" + this.uniqueId, this);
    }
  },
  setScroll: function(x, y) {
    if (y !== this.scrollY || x !== this.scrollX) {
      this.scrollX = x;
      this.scrollY = y;
      return EventBus.dispatch("!scroll:" + this.uniqueId, this);
    }
  },
  dispose: function() {
    return this.release();
  }
}));

});

window.require.register('models/Wolf', function(require, module) {
var config, utils;

require('utils');

require('config');

utils = moduleLibrary.get('utils');

config = moduleLibrary.get('config');

moduleLibrary.define('Wolf.Model', gamecore.Pooled.extend('WolfModel', {
  create: function(x, y, tileMapModel, entityManagerView) {
    var wolfModel;
    wolfModel = this._super();
    wolfModel.x = x;
    wolfModel.y = y;
    wolfModel.path = [];
    wolfModel.direction = 'South';
    wolfModel.tileMapModel = tileMapModel;
    wolfModel.entityManagerView = entityManagerView;
    wolfModel.moving = false;
    wolfModel.stateMachine = this.stateMachine(wolfModel);
    wolfModel.minimapColor = '#b03c25';
    return wolfModel;
  },
  stateMachine: function(wolfModel) {
    return StateMachine.create({
      initial: 'resting',
      events: [
        {
          name: 'work',
          from: 'resting',
          to: 'working'
        }, {
          name: 'work',
          from: 'working',
          to: 'working'
        }, {
          name: 'rest',
          from: 'working',
          to: 'resting'
        }
      ],
      callbacks: {
        onrest: function() {
          var path, result;
          result = wolfModel.getPathToNearestRabbit();
          path = result.path;
          if (path.length) {
            wolfModel.path = path;
            wolfModel.moving = true;
            return wolfModel.targetRabbit = result.model;
          }
        },
        onwork: function() {
          if (wolfModel.path.length <= 1 && wolfModel.targetRabbit) {
            return wolfModel.targetRabbit.energy -= 2;
          }
        }
      }
    });
  }
}, {
  getPathToNearestRabbit: function() {
    var nearestRabbit, path, rabbitModel, rabbitModels, rabbitProximityManager, shortestPath, _i, _len;
    rabbitProximityManager = this.entityManagerView.rabbitProximityManager;
    rabbitModels = rabbitProximityManager.getNeighbors(this);
    shortestPath = [];
    nearestRabbit = void 0;
    for (_i = 0, _len = rabbitModels.length; _i < _len; _i++) {
      rabbitModel = rabbitModels[_i];
      path = this.getPath(rabbitModel);
      if (path.length > 1) {
        if (shortestPath.length === 0) {
          shortestPath = path;
          nearestRabbit = rabbitModel;
        } else if (path.length < shortestPath.length) {
          shortestPath = path;
          nearestRabbit = rabbitModel;
        }
      }
    }
    return {
      path: shortestPath,
      model: nearestRabbit
    };
  },
  setPosition: function(x, y) {
    if (x !== this.x || y !== this.y) {
      this.x = x;
      this.y = y;
      return EventBus.dispatch("!move:" + this.uniqueId);
    }
  },
  tick: function() {
    if (this.moving) {
      this.followPath();
      this.stateMachine.work();
      return this.stateMachine.rest();
    } else {
      switch (this.stateMachine.current) {
        case 'working':
          return this.stateMachine.rest();
        case 'resting':
          return this.stateMachine.work();
      }
    }
  },
  getPath: function(targetModel) {
    var path;
    path = this.tileMapModel.findPath(this.x, this.y, targetModel.x, targetModel.y, 60, 60);
    return path;
  },
  followPath: function() {
    var dX, dY, nearPath, newDirection, newX, newY, path;
    path = this.path;
    nearPath = path.shift();
    this.path = path;
    if (!this.path.length) {
      this.moving = false;
    }
    if (!((nearPath != null) && !!nearPath.length)) {
      return;
    }
    dX = nearPath[0];
    dY = nearPath[1];
    newX = utils.clamp(this.x + dX, config.worldTileWidth);
    newY = utils.clamp(this.y + dY, config.worldTileHeight);
    newDirection = 'South';
    if (dX > 0) {
      this.direction = 'East';
    }
    if (dX < 0) {
      this.direction = 'West';
    }
    if (dY > 0) {
      this.direction = 'South';
    }
    if (dY < 0) {
      this.direction = 'North';
    }
    return this.setPosition(newX, newY);
  },
  dispose: function() {
    return this.release();
  }
}));

});

window.require.register('scenes/FoodChain', function(require, module) {
var CARROT_COUNT, RABBIT_COUNT, WOLF_COUNT, config, utils;

require('models/Viewport');

require('models/TileMap');

require('config');

require('utils');

require('views/EntityManager');

require('views/Minimap');

config = moduleLibrary.get('config');

utils = moduleLibrary.get('utils');

CARROT_COUNT = 140;

RABBIT_COUNT = 20;

WOLF_COUNT = 2;

moduleLibrary.define('PlanetSurface.Scene', gamecore.Pooled.extend('PlanetSurfaceScene', moduleLibrary.define('FoodChain.Scene', gamecore.Pooled.extend('FoodChainScene', {
  create: function(seed, sessionRandom) {
    var foodChainScene;
    console.log('Food Chain Scene');
    console.log('seed:', seed);
    console.log('sessionSeed:', sessionRandom);
    foodChainScene = this._super();
    foodChainScene.el = new createjs.Container;
    foodChainScene.views = {};
    foodChainScene.models = {};
    foodChainScene.seed = seed;
    foodChainScene.models.tileMapModel = (moduleLibrary.get('TileMap.Model')).create(config.generator.location, config.generator.name, config.generator.options, seed);
    foodChainScene.models.tileMapModel.cacheAllTiles();
    this.createViewport(foodChainScene, foodChainScene.models.tileMapModel);
    foodChainScene.views.entityManagerView = (moduleLibrary.get('EntityManager.View')).create(foodChainScene.models.viewportModel, foodChainScene.models.tileMapModel);
    foodChainScene.el.addChild(foodChainScene.views.entityManagerView.el);
    foodChainScene.views.entityManagerView.addCarrots(CARROT_COUNT, foodChainScene.models.tileMapModel);
    foodChainScene.views.entityManagerView.addRabbits(RABBIT_COUNT, foodChainScene.models.tileMapModel);
    foodChainScene.views.entityManagerView.addWolves(WOLF_COUNT, foodChainScene.models.tileMapModel);
    foodChainScene.views.minimapView = (moduleLibrary.get('Minimap.View')).create(foodChainScene.models.tileMapModel, foodChainScene.views.entityManagerView, foodChainScene.models.viewportModel);
    foodChainScene.el.addChild(foodChainScene.views.minimapView.el);
    _.bindAll(foodChainScene, 'onTick');
    createjs.Ticker.addEventListener('tick', foodChainScene.onTick);
    EventBus.addEventListener('!key:down', foodChainScene.onKeyDown, foodChainScene);
    return foodChainScene;
  },
  createViewport: function(foodChainScene, tileMapModel) {
    var viewportX, viewportY;
    viewportX = Math.floor(config.worldTileWidth / 2);
    viewportY = Math.floor(config.worldTileHeight / 2);
    foodChainScene.models.viewportModel = (moduleLibrary.get('Viewport.Model')).create(viewportX, viewportY, config.viewportOptions.width, config.viewportOptions.height);
    foodChainScene.views.viewportView = (moduleLibrary.get('Viewport.View')).create(foodChainScene.models.viewportModel, tileMapModel);
    return foodChainScene.el.addChild(foodChainScene.views.viewportView.el);
  }
}, {
  onTick: function(event) {
    var h, w;
    this.views.entityManagerView.onTick(event);
    this.views.minimapView.onTick(event);
    w = config.viewportOptions.width * config.tileWidth;
    return h = config.viewportOptions.height * config.tileHeight;
  },
  onKeyDown: function(_event, args) {
    if (args.keyCode === 78) {
      return EventBus.dispatch('!scene:load', this, {
        sceneLocation: 'scenes/PlanetSurface',
        sceneName: 'PlanetSurface.Scene',
        seed: Math.floor(utils.sessionRandom() * 0xfff)
      });
    }
  },
  dispose: function() {
    _.invoke(this.views, 'dispose');
    _.invoke(this.models, 'dispose');
    EventBus.removeEventListener('!key:down', this.onKeyDown, this);
    return this.release();
  }
}))));

});

window.require.register('utils', function(require, module) {
var config;

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

window.require.register('views/CanvasAdapter', function(require, module) {

moduleLibrary.define('CanvasAdapter.View', gamecore.Pooled.extend('CanvasAdapterView', {
  create: function(rawOptions) {
    var canvasAdapterView, options;
    if (rawOptions == null) {
      rawOptions = {};
    }
    options = _.defaults(rawOptions, this.DEFAULT_OPTIONS);
    canvasAdapterView = this._super();
    canvasAdapterView.canvasEl = document.createElement('canvas');
    canvasAdapterView.canvasEl.width = options.width;
    canvasAdapterView.canvasEl.height = options.height;
    document.body.appendChild(canvasAdapterView.canvasEl);
    return canvasAdapterView;
  },
  DEFAULT_OPTIONS: {
    width: 480,
    height: 320
  }
}, {
  dispose: function() {
    this.canvasEl.parentNode.removeChild(this.canvasEl);
    return this.release();
  }
}));

});

window.require.register('views/Carrot', function(require, module) {
var config, utils;

require('utils');

require('config');

utils = moduleLibrary.get('utils');

config = moduleLibrary.get('config');

moduleLibrary.define('Carrot.View', gamecore.Pooled.extend('CarrotView', {
  create: function(carrotModel, viewportModel) {
    var carrotView;
    carrotView = this._super();
    carrotView.offsetX = 0;
    carrotView.offsetY = 0;
    carrotView.scrollX = 0;
    carrotView.scrollY = 0;
    carrotView.model = carrotModel;
    carrotView.viewportModel = viewportModel;
    carrotView.spriteSheet = new createjs.SpriteSheet(this.spriteSheetOptions);
    carrotView.el = new createjs.Sprite(carrotView.spriteSheet, ('first second third fourth'.split(' '))[carrotModel.maturity]);
    EventBus.addEventListener("!move:" + viewportModel.uniqueId, carrotView.setPosition, carrotView);
    carrotView.setPosition();
    _.bindAll(carrotView, 'onTick');
    carrotView.el.addEventListener('tick', carrotView.onTick);
    return carrotView;
  },
  spriteSheetOptions: {
    images: [utils.tilesetImg],
    frames: {
      width: config.tileWidth,
      height: config.tileHeight
    },
    animations: {
      first: {
        frames: [272]
      },
      second: {
        frames: [273]
      },
      third: {
        frames: [274]
      },
      fourth: {
        frames: [275]
      }
    }
  }
}, {
  setPosition: function() {
    var centerX, centerY, halfWorldHeight, halfWorldWidth, myNewX, myNewY, myX, myY, newX, newY, offsetX, offsetY, viewX, viewY, worldHeight, worldWidth, x, y;
    centerX = Math.floor(this.viewportModel.width / 2);
    centerY = Math.floor(this.viewportModel.height / 2);
    viewX = this.viewportModel.x;
    viewY = this.viewportModel.y;
    myX = this.model.x;
    myY = this.model.y;
    x = (myX - viewX) + centerX;
    y = (myY - viewY) + centerY;
    worldWidth = config.worldTileWidth;
    halfWorldWidth = Math.floor(worldWidth / 2);
    worldHeight = config.worldTileHeight;
    halfWorldHeight = Math.floor(worldHeight / 2);
    offsetX = 0;
    offsetY = 0;
    if (myX > viewX + halfWorldWidth) {
      offsetX -= worldWidth;
    }
    if (myX < viewX - halfWorldWidth) {
      offsetX += worldWidth;
    }
    if (myY > viewY + halfWorldHeight) {
      offsetY -= worldHeight;
    }
    if (myY < viewY - halfWorldHeight) {
      offsetY += worldHeight;
    }
    myNewX = x + offsetX;
    myNewY = y + offsetY;
    newX = myNewX * config.tileWidth;
    newY = myNewY * config.tileHeight;
    this.intendedX = newX;
    return this.intendedY = newY;
  },
  onTick: function() {
    var animation;
    animation = ('first second third fourth'.split(' '))[this.model.maturity];
    if (this.el.currentAnimation !== animation) {
      this.el.gotoAndPlay(animation);
    }
    this.el.x = this.intendedX + this.scrollX;
    return this.el.y = this.intendedY + this.scrollY;
  },
  dispose: function() {
    EventBus.removeEventListener("!move:" + this.viewportModel.uniqueId, this.setPosition, this);
    return this.release();
  }
}));

});

window.require.register('views/EntityManager', function(require, module) {
var ProximityManager, config, utils;

require('config');

require('utils');

require('models/Carrot');

require('views/Carrot');

require('models/Rabbit');

require('views/Rabbit');

require('models/Wolf');

require('views/Wolf');

config = moduleLibrary.get('config');

utils = moduleLibrary.get('utils');

moduleLibrary.define('EntityManager.View', gamecore.Pooled.extend('EntityManagerView', {
  create: function(viewportModel, tileMapModel) {
    var entityManagerView;
    entityManagerView = this._super();
    entityManagerView.el = new createjs.Container;
    entityManagerView.carrotLayerEl = new createjs.Container;
    entityManagerView.el.addChild(entityManagerView.carrotLayerEl);
    entityManagerView.rabbitLayerEl = new createjs.Container;
    entityManagerView.el.addChild(entityManagerView.rabbitLayerEl);
    entityManagerView.wolfLayerEl = new createjs.Container;
    entityManagerView.el.addChild(entityManagerView.wolfLayerEl);
    entityManagerView.lastUpdate = 0;
    entityManagerView.carrotProximityManager = new ProximityManager(config.generator.options.worldChunkWidth, config.generator.options.worldChunkHeight, config.worldTileWidth, config.worldTileHeight);
    entityManagerView.rabbitProximityManager = new ProximityManager(config.generator.options.worldChunkWidth, config.generator.options.worldChunkHeight, config.worldTileWidth, config.worldTileHeight);
    entityManagerView.scrollX = 0;
    entityManagerView.scrollY = 0;
    entityManagerView.entityViews = [];
    entityManagerView.entityModels = [];
    entityManagerView.carrotModels = [];
    entityManagerView.carrotCount = 0;
    entityManagerView.carrotGenesisCounter = 10;
    entityManagerView.tickCounter = 0;
    entityManagerView.permanentsLookup = {};
    entityManagerView.viewportModel = viewportModel;
    entityManagerView.tileMapModel = tileMapModel;
    EventBus.addEventListener("!move:" + viewportModel.uniqueId, entityManagerView.setPosition, entityManagerView);
    return entityManagerView;
  }
}, {
  spawnRabbit: function(parentRabbitModel) {
    var rabbitModel, rabbitView, x, y;
    x = parentRabbitModel.x;
    y = parentRabbitModel.y;
    rabbitModel = (moduleLibrary.get('Rabbit.Model')).create(x, y, parentRabbitModel.tileMapModel, this);
    rabbitView = (moduleLibrary.get('Rabbit.View')).create(rabbitModel, this.viewportModel);
    this.rabbitLayerEl.addChild(rabbitView.el);
    this.entityViews.push(rabbitView);
    this.entityModels.push(rabbitModel);
    this.rabbitProximityManager.addEntity(rabbitModel);
    return this.rabbitProximityManager.refresh();
  },
  removeRabbit: function(rabbitModel) {
    var entityModelIndex, entityViewIndex, index, model, view;
    entityViewIndex = ((function() {
      var _i, _len, _ref, _results;
      _ref = this.entityViews;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        view = _ref[index];
        if (view.model === rabbitModel) {
          _results.push(index);
        }
      }
      return _results;
    }).call(this))[0];
    entityModelIndex = ((function() {
      var _i, _len, _ref, _results;
      _ref = this.entityModels;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        model = _ref[index];
        if (model === rabbitModel) {
          _results.push(index);
        }
      }
      return _results;
    }).call(this))[0];
    if (entityViewIndex !== void 0) {
      this.rabbitProximityManager.removeEntity(this.entityModels[entityModelIndex]);
      this.rabbitProximityManager.refresh();
      this.rabbitLayerEl.removeChild(this.entityViews[entityViewIndex].el);
      this.entityViews[entityViewIndex].dispose();
      this.entityModels[entityModelIndex].dispose();
      this.entityViews.splice(entityViewIndex, 1);
      this.entityModels.splice(entityModelIndex, 1);
      return true;
    }
    return false;
  },
  removeCarrot: function(carrotModel) {
    var carrotModelIndex, entityModelIndex, entityViewIndex, index, model, view, x, y;
    entityViewIndex = ((function() {
      var _i, _len, _ref, _results;
      _ref = this.entityViews;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        view = _ref[index];
        if (view.model === carrotModel) {
          _results.push(index);
        }
      }
      return _results;
    }).call(this))[0];
    entityModelIndex = ((function() {
      var _i, _len, _ref, _results;
      _ref = this.entityModels;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        model = _ref[index];
        if (model === carrotModel) {
          _results.push(index);
        }
      }
      return _results;
    }).call(this))[0];
    carrotModelIndex = ((function() {
      var _i, _len, _ref, _results;
      _ref = this.carrotModels;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        model = _ref[index];
        if (model === carrotModel) {
          _results.push(index);
        }
      }
      return _results;
    }).call(this))[0];
    if (entityViewIndex !== void 0) {
      x = carrotModel.x;
      y = carrotModel.y;
      delete this.permanentsLookup["" + x + "_" + y];
      this.carrotCount -= 1;
      this.carrotProximityManager.removeEntity(this.entityModels[entityModelIndex]);
      this.carrotProximityManager.refresh();
      this.carrotLayerEl.removeChild(this.entityViews[entityViewIndex].el);
      this.entityViews[entityViewIndex].dispose();
      this.entityModels[entityModelIndex].dispose();
      this.entityViews.splice(entityViewIndex, 1);
      this.entityModels.splice(entityModelIndex, 1);
      this.carrotModels.splice(carrotModelIndex, 1);
      return true;
    }
    return false;
  },
  setPosition: function() {
    return _.each(this.entityViews, function(entityView) {
      entityView.setPosition();
      return entityView.onTick();
    });
  },
  onTick: function(event) {
    var diff, scrollX, scrollY, size, timeDelta;
    timeDelta = event.time - this.lastUpdate;
    scrollX = this.viewportModel.scrollX;
    scrollY = this.viewportModel.scrollY;
    this.el.x = scrollX;
    this.el.y = scrollY;
    if (Math.floor(timeDelta / 500) >= 1) {
      _.each(this.entityModels, function(entityModel) {
        return entityModel.tick();
      });
      this.lastUpdate = event.time;
      this.rabbitProximityManager.refresh();
      this.carrotGenesisCounter -= 1;
      if (this.carrotGenesisCounter < 0) {
        this.carrotGenesisCounter = 10;
        if (this.carrotCount < 100) {
          diff = 100 - this.carrotCount;
          size = Math.floor(diff / 2);
          return this.addCarrots(size, this.tileMapModel, 0, 20);
        }
      }
    }
  },
  addCarrots: function(populationSize, tileMapModel, maturity, maturityCount) {
    var carrotCount, carrotModel, carrotView, m, mC, s, tile, x, y;
    carrotCount = 0;
    while (carrotCount < populationSize) {
      s = config.sessionRandom += 3;
      x = Math.floor(utils.random(s) * config.worldTileWidth);
      y = Math.floor(utils.random(s + 1) * config.worldTileHeight);
      m = maturity != null ? maturity : Math.floor(utils.random(s + 2) * 4);
      mC = maturityCount != null ? maturityCount : Math.floor(utils.random(s + 3) * 18 + 1);
      tile = tileMapModel.getTile(x, y);
      if (tile === 255 && this.permanentsLookup["" + x + "_" + y] !== true) {
        carrotCount += 1;
        carrotModel = (moduleLibrary.get('Carrot.Model')).create(x, y, m, mC);
        carrotView = (moduleLibrary.get('Carrot.View')).create(carrotModel, this.viewportModel);
        this.carrotLayerEl.addChild(carrotView.el);
        this.entityViews.push(carrotView);
        this.entityModels.push(carrotModel);
        this.carrotModels.push(carrotModel);
        this.carrotProximityManager.addEntity(carrotModel);
        this.permanentsLookup["" + x + "_" + y] = true;
      }
    }
    this.carrotCount += carrotCount;
    return this.carrotProximityManager.refresh();
  },
  addRabbits: function(populationSize, tileMapModel) {
    var rabbitCount, rabbitModel, rabbitView, s, tile, x, y;
    rabbitCount = 0;
    while (rabbitCount < populationSize) {
      s = config.sessionRandom += 1;
      x = Math.floor(utils.random(s) * config.worldTileWidth);
      y = Math.floor(utils.random(s + 1) * config.worldTileHeight);
      tile = tileMapModel.getTile(x, y);
      if (tile === 255) {
        rabbitCount += 1;
        rabbitModel = (moduleLibrary.get('Rabbit.Model')).create(x, y, tileMapModel, this);
        rabbitView = (moduleLibrary.get('Rabbit.View')).create(rabbitModel, this.viewportModel);
        this.rabbitLayerEl.addChild(rabbitView.el);
        this.entityViews.push(rabbitView);
        this.entityModels.push(rabbitModel);
        this.rabbitProximityManager.addEntity(rabbitModel);
      }
    }
    return this.rabbitProximityManager.refresh();
  },
  addWolves: function(populationSize, tileMapModel) {
    var s, tile, wolfCount, wolfModel, wolfView, x, y, _results;
    wolfCount = 0;
    _results = [];
    while (wolfCount < populationSize) {
      s = config.sessionRandom += 1;
      x = Math.floor(utils.random(s) * config.worldTileWidth);
      y = Math.floor(utils.random(s + 1) * config.worldTileHeight);
      tile = tileMapModel.getTile(x, y);
      if (tile === 255) {
        wolfCount += 1;
        wolfModel = (moduleLibrary.get('Wolf.Model')).create(x, y, tileMapModel, this);
        wolfView = (moduleLibrary.get('Wolf.View')).create(wolfModel, this.viewportModel);
        this.wolfLayerEl.addChild(wolfView.el);
        this.entityViews.push(wolfView);
        _results.push(this.entityModels.push(wolfModel));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  },
  dispose: function() {
    _.each(this.entityViews, function(creatureView) {
      creatureView.model.dispose();
      return creatureView.dispose();
    });
    return this.release();
  }
}));

ProximityManager = (function() {

  function ProximityManager(gridWidth, gridHeight, totalWidth, totalHeight) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.worldWidth = totalWidth / this.gridWidth;
    this.worldHeight = totalHeight / this.gridHeight;
    this.entities = {};
    this.positions = [];
    this.cachedResults = [];
  }

  ProximityManager.prototype.addEntity = function(entityModel) {
    return this.entities[entityModel.uniqueId] = entityModel;
  };

  ProximityManager.prototype.removeEntity = function(entityModel) {
    return delete this.entities[entityModel.uniqueId];
  };

  ProximityManager.prototype.getNeighbors = function(entityModel) {
    var addResult, cX, cY, clamp, index, results, toIndex, x, y,
      _this = this;
    x = Math.floor(entityModel.x / this.gridWidth);
    y = Math.floor(entityModel.y / this.gridHeight);
    index = y * this.worldWidth + x;
    results = this.positions[index] || [];
    clamp = function(index, size) {
      return (index + size) % size;
    };
    cX = function(index) {
      return clamp(index, _this.worldWidth);
    };
    cY = function(index) {
      return clamp(index, _this.worldHeight);
    };
    addResult = function(index) {
      if (_this.positions[index]) {
        return results = results.concat(_this.positions[index]);
      }
    };
    toIndex = function(x, y) {
      return cY(y) * _this.worldWidth + cX(x);
    };
    addResult(toIndex(x - 1, y - 1));
    addResult(toIndex(x, y - 1));
    addResult(toIndex(x + 1, y - 1));
    addResult(toIndex(x - 1, y));
    addResult(toIndex(x + 1, y));
    addResult(toIndex(x - 1, y + 1));
    addResult(toIndex(x, y + 1));
    addResult(toIndex(x + 1, y + 1));
    this.cachedResults = [];
    return results;
  };

  ProximityManager.prototype.refresh = function() {
    var entityModel, index, uniqueId, x, y, _ref;
    this.positions = [];
    _ref = this.entities;
    for (uniqueId in _ref) {
      entityModel = _ref[uniqueId];
      x = Math.floor(entityModel.x / this.gridWidth);
      y = Math.floor(entityModel.y / this.gridHeight);
      index = y * this.worldWidth + x;
      if (this.positions[index] === void 0) {
        this.positions[index] = [entityModel];
      } else {
        this.positions[index].push(entityModel);
      }
    }
    return this.cachedResults = [];
  };

  return ProximityManager;

})();

});

window.require.register('views/Minimap', function(require, module) {
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

});

window.require.register('views/Rabbit', function(require, module) {
var config, utils;

require('utils');

require('config');

utils = moduleLibrary.get('utils');

config = moduleLibrary.get('config');

moduleLibrary.define('Rabbit.View', gamecore.Pooled.extend('RabbitView', {
  create: function(rabbitModel, viewportModel) {
    var rabbitView;
    rabbitView = this._super();
    rabbitView.offsetX = 0;
    rabbitView.offsetY = 0;
    rabbitView.model = rabbitModel;
    rabbitView.viewportModel = viewportModel;
    rabbitView.spriteSheet = new createjs.SpriteSheet(this.spriteSheetOptions);
    rabbitView.el = new createjs.Sprite(rabbitView.spriteSheet, 'walkEast');
    EventBus.addEventListener("!move:" + rabbitModel.uniqueId, rabbitView.onModelMove, rabbitView);
    EventBus.addEventListener("!move:" + viewportModel.uniqueId, rabbitView.setPosition, rabbitView);
    rabbitView.setPosition();
    _.bindAll(rabbitView, 'onTick');
    rabbitView.el.addEventListener('tick', rabbitView.onTick);
    return rabbitView;
  },
  spriteSheetOptions: {
    images: [utils.tilesetImg],
    frames: {
      width: config.tileWidth,
      height: config.tileHeight
    },
    animations: {
      restingEast: {
        frames: [304, 305, 306, 307],
        speed: 0.5
      },
      restingNorth: {
        frames: [308, 309, 310, 311],
        speed: 0.5
      },
      restingWest: {
        frames: [312, 313, 314, 315],
        speed: 0.5
      },
      restingSouth: {
        frames: [316, 317, 318, 319],
        speed: 0.5
      },
      workingSouth: {
        frames: [328, 329],
        speed: 0.1
      },
      workingWest: {
        frames: [330, 331],
        speed: 0.1
      },
      workingNorth: {
        frames: [332, 333],
        speed: 0.1
      },
      workingEast: {
        frames: [334, 335],
        speed: 0.1
      }
    }
  }
}, {
  onModelMove: function() {
    var dX, dY;
    dX = 0;
    dY = 0;
    switch (this.model.direction) {
      case 'North':
        dY = config.tileHeight;
        break;
      case 'East':
        dX = 0 - config.tileWidth;
        break;
      case 'South':
        dY = 0 - config.tileHeight;
        break;
      case 'West':
        dX = config.tileWidth;
    }
    this.offsetX = dX;
    this.offsetY = dY;
    createjs.Tween.get(this).to({
      offsetX: 0,
      offsetY: 0
    }, 450);
    return this.setPosition();
  },
  setPosition: function() {
    var animation, centerX, centerY, halfWorldHeight, halfWorldWidth, myNewX, myNewY, myX, myY, newX, newY, offsetX, offsetY, viewX, viewY, worldHeight, worldWidth, x, y;
    animation = "" + this.model.stateMachine.current + this.model.direction;
    if (this.el.currentAnimation !== animation) {
      this.el.gotoAndPlay(animation);
    }
    centerX = Math.floor(this.viewportModel.width / 2);
    centerY = Math.floor(this.viewportModel.height / 2);
    viewX = this.viewportModel.x;
    viewY = this.viewportModel.y;
    myX = this.model.x;
    myY = this.model.y;
    x = (myX - viewX) + centerX;
    y = (myY - viewY) + centerY;
    worldWidth = config.worldTileWidth;
    halfWorldWidth = Math.floor(worldWidth / 2);
    worldHeight = config.worldTileHeight;
    halfWorldHeight = Math.floor(worldHeight / 2);
    offsetX = 0;
    offsetY = 0;
    if (myX > viewX + halfWorldWidth) {
      offsetX -= worldWidth;
    }
    if (myX < viewX - halfWorldWidth) {
      offsetX += worldWidth;
    }
    if (myY > viewY + halfWorldHeight) {
      offsetY -= worldHeight;
    }
    if (myY < viewY - halfWorldHeight) {
      offsetY += worldHeight;
    }
    myNewX = x + offsetX;
    myNewY = y + offsetY;
    newX = myNewX * config.tileWidth;
    newY = myNewY * config.tileHeight;
    this.intendedX = newX;
    return this.intendedY = newY;
  },
  onTick: function() {
    this.el.x = this.intendedX + this.offsetX;
    return this.el.y = this.intendedY + this.offsetY;
  },
  dispose: function() {
    EventBus.removeEventListener("!move:" + this.viewportModel.uniqueId, this.setPosition, this);
    EventBus.removeEventListener("!move:" + this.model.uniqueId, this.onModelMove, this);
    return this.release();
  }
}));

});

window.require.register('views/Stage', function(require, module) {
var config;

require('config');

config = moduleLibrary.get('config');

moduleLibrary.define('Stage.View', gamecore.Pooled.extend('StageView', {
  create: function(canvasEl, sceneLocation, sceneName) {
    var stageView;
    stageView = this._super();
    stageView.el = new createjs.Stage(canvasEl);
    stageView.el.enableMouseOver(10);
    stageView.loadScene(sceneLocation, sceneName, config.seed, config.sessionRandom);
    createjs.Ticker.setFPS(config.fps);
    createjs.Ticker.useRAF = true;
    _.bindAll(stageView, 'onTick');
    createjs.Ticker.addEventListener('tick', stageView.onTick);
    EventBus.addEventListener('!scene:load', stageView.onSceneLoad, stageView);
    return stageView;
  }
}, {
  onSceneLoad: function(event, sceneProperties) {
    return this.loadScene(sceneProperties.sceneLocation, sceneProperties.sceneName, sceneProperties.seed, sceneProperties.seed);
  },
  loadScene: function(sceneLocation, sceneName, seed, sessionRandom) {
    if (this.scene) {
      this.scene.dispose();
      this.el.removeChild(this.scene.el);
    }
    require(sceneLocation);
    this.scene = (moduleLibrary.get(sceneName)).create(seed, sessionRandom);
    return this.el.addChild(this.scene.el);
  },
  onTick: function(event) {
    return this.el.update();
  },
  dispose: function() {
    this.scene.dispose();
    return this.release();
  }
}));

});

window.require.register('views/Tile', function(require, module) {
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

});

window.require.register('views/Viewport', function(require, module) {
var config, utils;

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

window.require.register('views/Wolf', function(require, module) {
var config, utils;

require('utils');

require('config');

utils = moduleLibrary.get('utils');

config = moduleLibrary.get('config');

moduleLibrary.define('Wolf.View', gamecore.Pooled.extend('Wolf', {
  create: function(wolfModel, viewportModel) {
    var wolfView;
    wolfView = this._super();
    wolfView.offsetX = 0;
    wolfView.offsetY = 0;
    wolfView.model = wolfModel;
    wolfView.viewportModel = viewportModel;
    wolfView.spriteSheet = new createjs.SpriteSheet(this.spriteSheetOptions);
    wolfView.el = new createjs.Sprite(wolfView.spriteSheet, 'sleepSouth');
    EventBus.addEventListener("!move:" + wolfModel.uniqueId, wolfView.onModelMove, wolfView);
    EventBus.addEventListener("!move:" + viewportModel.uniqueId, wolfView.setPosition, wolfView);
    wolfView.setPosition();
    _.bindAll(wolfView, 'onTick');
    wolfView.el.addEventListener('tick', wolfView.onTick);
    return wolfView;
  },
  spriteSheetOptions: {
    images: [utils.tilesetImg],
    frames: {
      width: config.tileWidth,
      height: config.tileHeight
    },
    animations: {
      restingEast: {
        frames: [288, 289, 290, 291],
        speed: 0.5
      },
      restingNorth: {
        frames: [292, 293, 294, 295],
        speed: 0.5
      },
      restingWest: {
        frames: [296, 297, 298, 299],
        speed: 0.5
      },
      restingSouth: {
        frames: [300, 301, 302, 303],
        speed: 0.5
      },
      workingSouth: {
        frames: [320, 321],
        speed: 0.1
      },
      workingWest: {
        frames: [322, 323],
        speed: 0.1
      },
      workingNorth: {
        frames: [324, 325],
        speed: 0.1
      },
      workingEast: {
        frames: [326, 327],
        speed: 0.1
      }
    }
  }
}, {
  onModelMove: function() {
    var dX, dY;
    dX = 0;
    dY = 0;
    switch (this.model.direction) {
      case 'North':
        dY = config.tileHeight;
        break;
      case 'East':
        dX = 0 - config.tileWidth;
        break;
      case 'South':
        dY = 0 - config.tileHeight;
        break;
      case 'West':
        dX = config.tileWidth;
    }
    this.offsetX = dX;
    this.offsetY = dY;
    createjs.Tween.get(this).to({
      offsetX: 0,
      offsetY: 0
    }, 450);
    return this.setPosition();
  },
  setPosition: function() {
    var animation, centerX, centerY, halfWorldHeight, halfWorldWidth, myNewX, myNewY, myX, myY, newX, newY, offsetX, offsetY, viewX, viewY, worldHeight, worldWidth, x, y;
    animation = "" + this.model.stateMachine.current + this.model.direction;
    if (this.el.currentAnimation !== animation) {
      this.el.gotoAndPlay(animation);
    }
    centerX = Math.floor(this.viewportModel.width / 2);
    centerY = Math.floor(this.viewportModel.height / 2);
    viewX = this.viewportModel.x;
    viewY = this.viewportModel.y;
    myX = this.model.x;
    myY = this.model.y;
    x = (myX - viewX) + centerX;
    y = (myY - viewY) + centerY;
    worldWidth = config.worldTileWidth;
    halfWorldWidth = Math.floor(worldWidth / 2);
    worldHeight = config.worldTileHeight;
    halfWorldHeight = Math.floor(worldHeight / 2);
    offsetX = 0;
    offsetY = 0;
    if (myX > viewX + halfWorldWidth) {
      offsetX -= worldWidth;
    }
    if (myX < viewX - halfWorldWidth) {
      offsetX += worldWidth;
    }
    if (myY > viewY + halfWorldHeight) {
      offsetY -= worldHeight;
    }
    if (myY < viewY - halfWorldHeight) {
      offsetY += worldHeight;
    }
    myNewX = x + offsetX;
    myNewY = y + offsetY;
    newX = myNewX * config.tileWidth;
    newY = myNewY * config.tileHeight;
    this.intendedX = newX;
    return this.intendedY = newY;
  },
  onTick: function() {
    this.el.x = this.intendedX + this.offsetX;
    return this.el.y = this.intendedY + this.offsetY;
  },
  dispose: function() {
    EventBus.removeEventListener("!move:" + this.viewportModel.uniqueId, this.setPosition, this);
    EventBus.removeEventListener("!move:" + this.model.uniqueId, this.onModelMove, this);
    return this.release();
  }
}));

});
