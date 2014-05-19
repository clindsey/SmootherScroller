require 'models/Viewport'
require 'models/TileMap'
require 'config'
require 'utils'
require 'views/EntityManager'
require 'views/Minimap'

config = moduleLibrary.get 'config'
utils = moduleLibrary.get 'utils'

CARROT_COUNT = 100
RABBIT_COUNT = 1
WOLF_COUNT = 0

# due for refactor. should attach views dynamically
# the name for the models and views here is just stupid
moduleLibrary.define 'PlanetSurface.Scene', gamecore.Pooled.extend 'PlanetSurfaceScene',
moduleLibrary.define 'FoodChain.Scene', gamecore.Pooled.extend 'FoodChainScene',
    create: (seed, sessionRandom) ->
      console.log 'Food Chain Scene'
      console.log 'seed:', seed
      console.log 'sessionSeed:', sessionRandom

      foodChainScene = @_super()

      foodChainScene.el = new createjs.Container

      foodChainScene.views = {}
      foodChainScene.models = {}

      foodChainScene.seed = seed

      foodChainScene.models.tileMapModel = (moduleLibrary.get 'TileMap.Model').create config.generator.location, config.generator.name, config.generator.options, seed

      foodChainScene.models.tileMapModel.cacheAllTiles()

      @createViewport foodChainScene, foodChainScene.models.tileMapModel

      foodChainScene.views.entityManagerView = (moduleLibrary.get 'EntityManager.View').create foodChainScene.models.viewportModel, foodChainScene.models.tileMapModel

      foodChainScene.el.addChild foodChainScene.views.entityManagerView.el
      foodChainScene.views.entityManagerView.addCarrots CARROT_COUNT, foodChainScene.models.tileMapModel
      foodChainScene.views.entityManagerView.addRabbits RABBIT_COUNT, foodChainScene.models.tileMapModel
      foodChainScene.views.entityManagerView.addWolves WOLF_COUNT, foodChainScene.models.tileMapModel

      foodChainScene.views.minimapView = (moduleLibrary.get 'Minimap.View').create foodChainScene.models.tileMapModel, foodChainScene.views.entityManagerView, foodChainScene.models.viewportModel
      foodChainScene.el.addChild foodChainScene.views.minimapView.el

      _.bindAll foodChainScene, 'onTick'
      createjs.Ticker.addEventListener 'tick', foodChainScene.onTick

      EventBus.addEventListener '!key:down', foodChainScene.onKeyDown, foodChainScene

      foodChainScene

    createViewport: (foodChainScene, tileMapModel) ->
      viewportX = Math.floor config.worldTileWidth / 2
      viewportY = Math.floor config.worldTileHeight / 2

      foodChainScene.models.viewportModel = (moduleLibrary.get 'Viewport.Model').create viewportX, viewportY, config.viewportOptions.width, config.viewportOptions.height
      foodChainScene.views.viewportView = (moduleLibrary.get 'Viewport.View').create foodChainScene.models.viewportModel, tileMapModel

      foodChainScene.el.addChild foodChainScene.views.viewportView.el
  ,
    onTick: (event) ->
      @views.entityManagerView.onTick event
      @views.minimapView.onTick event

      w = config.viewportOptions.width * config.tileWidth
      h = config.viewportOptions.height * config.tileHeight

      #@views.entityManagerView.el.cache 0 - w, 0 - h, w * 3, h * 3

    onKeyDown: (_event, args) ->
      if args.keyCode is 78
        EventBus.dispatch '!scene:load', this, {
          sceneLocation: 'scenes/PlanetSurface'
          sceneName: 'PlanetSurface.Scene'
          seed: Math.floor(utils.sessionRandom() * 0xfff)
        }

    dispose: ->
      _.invoke @views, 'dispose'
      _.invoke @models, 'dispose'

      EventBus.removeEventListener '!key:down', @onKeyDown, this

      @release()
