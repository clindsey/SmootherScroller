window.require.register('test/unit/initialize', function(require, module) {
var runner, test, tests, _i, _len;

tests = ['test/unit/views/test'];

for (_i = 0, _len = tests.length; _i < _len; _i++) {
  test = tests[_i];
  require(test);
}

if (window.mochaPhantomJS) {
  mochaPhantomJS.run();
} else {
  runner = mocha.run();
  runner.on('end', function() {
    return new MochaCov;
  });
}

});

window.require.register('test/unit/models/carrot', function(require, module) {
var CarrotModel;

require('models/Carrot');

CarrotModel = moduleLibrary.get('Carrot.Model');

describe('Model Carrot', function() {
  beforeEach(function() {
    return this.carrotModel = CarrotModel.create();
  });
  return afterEach(function() {
    return this.carrotModel.dispose();
  });
});

});

window.require.register('test/unit/models/rabbit', function(require, module) {
var RabbitModel;

require('models/Rabbit');

RabbitModel = moduleLibrary.get('Rabbit.Model');

describe('Model Rabbit', function() {
  beforeEach(function() {
    return this.rabbitModel = RabbitModel.create();
  });
  return afterEach(function() {
    return this.rabbitModel.dispose();
  });
});

});

window.require.register('test/unit/models/tile', function(require, module) {
var TileModel;

require('models/Tile');

TileModel = moduleLibrary.get('Tile.Model');

describe('Model Tile', function() {
  beforeEach(function() {
    return this.tileModel = TileModel.create();
  });
  return afterEach(function() {
    return this.tileModel.dispose();
  });
});

});

window.require.register('test/unit/models/tileMap', function(require, module) {
var TileMapModel;

require('models/TileMap');

TileMapModel = moduleLibrary.get('TileMap.Model');

describe('Model TileMap', function() {
  beforeEach(function() {
    return this.tileMapModel = TileMapModel.create();
  });
  return afterEach(function() {
    return this.tileMapModel.dispose();
  });
});

});

window.require.register('test/unit/models/viewport', function(require, module) {
var ViewportModel;

require('models/Viewport');

ViewportModel = moduleLibrary.get('Viewport.Model');

describe('Model Viewport', function() {
  beforeEach(function() {
    return this.viewportModel = ViewportModel.create();
  });
  return afterEach(function() {
    return this.viewportModel.dispose();
  });
});

});

window.require.register('test/unit/models/wolf', function(require, module) {
var WolfModel;

require('models/Wolf');

WolfModel = moduleLibrary.get('Wolf.Model');

describe('Model Wolf', function() {
  beforeEach(function() {
    return this.wolfModel = WolfModel.create();
  });
  return afterEach(function() {
    return this.wolfModel.dispose();
  });
});

});

window.require.register('test/unit/scenes/foodChain', function(require, module) {
var FoodChainScene;

require('scenes/FoodChain');

FoodChainScene = moduleLibrary.get('FoodChain.Scene');

describe('Scene FoodChain', function() {
  beforeEach(function() {
    return this.foodChainScene = FoodChainScene.create();
  });
  return afterEach(function() {
    return this.foodChainScene.dispose();
  });
});

});

window.require.register('test/unit/views/canvasAdapter', function(require, module) {
var CanvasAdapterView;

require('views/CanvasAdapter');

CanvasAdapterView = moduleLibrary.get('CanvasAdapter.View');

describe('View CanvasAdapter', function() {
  beforeEach(function() {
    return this.canvasAdapterView = CanvasAdapterView.create();
  });
  return afterEach(function() {
    return this.canvasAdapterView.dispose();
  });
});

});

window.require.register('test/unit/views/carrot', function(require, module) {
var CarrotView;

require('views/Carrot');

CarrotView = moduleLibrary.get('Carrot.View');

describe('View Carrot', function() {
  beforeEach(function() {
    return this.carrotView = CarrotView.create();
  });
  return afterEach(function() {
    return this.carrotView.dispose();
  });
});

});

window.require.register('test/unit/views/entityManager', function(require, module) {
var EntityManagerView;

require('views/EntityManager');

EntityManagerView = moduleLibrary.get('EntityManager.View');

describe('View EntityManager', function() {
  beforeEach(function() {
    return this.entityManagerView = EntityManagerView.create();
  });
  return afterEach(function() {
    return this.entityManagerView.dispose();
  });
});

});

window.require.register('test/unit/views/minimap', function(require, module) {
var MinimapView;

require('views/Minimap');

MinimapView = moduleLibrary.get('Minimap.View');

describe('View Minimap', function() {
  beforeEach(function() {
    return this.minimapView = MinimapView.create();
  });
  return afterEach(function() {
    return this.minimapView.dispose();
  });
});

});

window.require.register('test/unit/views/rabbit', function(require, module) {
var RabbitView;

require('views/Rabbit');

RabbitView = moduleLibrary.get('Rabbit.View');

describe('View Rabbit', function() {
  beforeEach(function() {
    return this.rabbitView = RabbitView.create();
  });
  return afterEach(function() {
    return this.rabbitView.dispose();
  });
});

});

window.require.register('test/unit/views/stage', function(require, module) {
var StageView;

require('views/Stage');

StageView = moduleLibrary.get('Stage.View');

describe('View Stage', function() {
  beforeEach(function() {
    return this.stageView = StageView.create();
  });
  return afterEach(function() {
    return this.stageView.dispose();
  });
});

});

window.require.register('test/unit/views/tile', function(require, module) {
var TileView;

require('views/Tile');

TileView = moduleLibrary.get('Tile.View');

describe('View Tile', function() {
  beforeEach(function() {
    return this.tileView = TileView.create();
  });
  return afterEach(function() {
    return this.tileView.dispose();
  });
});

});

window.require.register('test/unit/views/viewport', function(require, module) {
var ViewportView;

require('views/Viewport');

ViewportView = moduleLibrary.get('Viewport.View');

describe('View Viewport', function() {
  beforeEach(function() {
    return this.viewportView = ViewportView.create();
  });
  return afterEach(function() {
    return this.viewportView.dispose();
  });
});

});

window.require.register('test/unit/views/wolf', function(require, module) {
var WolfView;

require('views/Wolf');

WolfView = moduleLibrary.get('Wolf.View');

describe('View Wolf', function() {
  beforeEach(function() {
    return this.wolfView = WolfView.create();
  });
  return afterEach(function() {
    return this.wolfView.dispose();
  });
});

});
