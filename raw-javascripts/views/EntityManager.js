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
