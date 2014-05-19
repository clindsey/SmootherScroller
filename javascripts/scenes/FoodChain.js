window.require.register("scenes/FoodChain", function(require, module) {var CARROT_COUNT, RABBIT_COUNT, WOLF_COUNT, config, utils;

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
