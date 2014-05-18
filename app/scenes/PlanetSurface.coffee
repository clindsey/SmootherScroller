require 'models/Viewport'
require 'models/TileMap'
require 'config'
require 'utils'
require 'views/EntityManager'
require 'views/Minimap'

config = moduleLibrary.get 'config'
utils = moduleLibrary.get 'utils'

VILLAGE_COUNT = 20

# due for refactor. should attach views dynamically
# the name for the models and views here is just stupid
moduleLibrary.define 'PlanetSurface.Scene', gamecore.Pooled.extend 'PlanetSurfaceScene',
    create: (seed, sessionRandom) ->
      console.log 'seed:', seed
      console.log 'sessionSeed:', sessionRandom

      planetSurfaceScene = @_super()

      planetSurfaceScene.el = new createjs.Container

      planetSurfaceScene.views = {}
      planetSurfaceScene.models = {}

      planetSurfaceScene.seed = seed

      planetSurfaceScene.models.tileMapModel = (moduleLibrary.get 'TileMap.Model').create config.generator.location, config.generator.name, config.generator.options, seed

      planetSurfaceScene.models.tileMapModel.cacheAllTiles()

      @createViewport planetSurfaceScene, planetSurfaceScene.models.tileMapModel

      planetSurfaceScene.views.entityManagerView = (moduleLibrary.get 'EntityManager.View').create planetSurfaceScene.models.viewportModel

      planetSurfaceScene.el.addChild planetSurfaceScene.views.entityManagerView.el
      planetSurfaceScene.views.entityManagerView.addVillage VILLAGE_COUNT, planetSurfaceScene.models.tileMapModel

      planetSurfaceScene.views.minimapView = (moduleLibrary.get 'Minimap.View').create planetSurfaceScene.models.tileMapModel, planetSurfaceScene.views.entityManagerView, planetSurfaceScene.models.viewportModel
      planetSurfaceScene.el.addChild planetSurfaceScene.views.minimapView.el

      _.bindAll planetSurfaceScene, 'onTick'
      createjs.Ticker.addEventListener 'tick', planetSurfaceScene.onTick

      EventBus.addEventListener '!key:down', planetSurfaceScene.onKeyDown, planetSurfaceScene

      planetSurfaceScene

    createViewport: (planetSurfaceScene, tileMapModel) ->
      viewportX = Math.floor config.worldTileWidth / 2
      viewportY = Math.floor config.worldTileHeight / 2

      planetSurfaceScene.models.viewportModel = (moduleLibrary.get 'Viewport.Model').create viewportX, viewportY, config.viewportOptions.width, config.viewportOptions.height
      planetSurfaceScene.views.viewportView = (moduleLibrary.get 'Viewport.View').create planetSurfaceScene.models.viewportModel, tileMapModel

      planetSurfaceScene.el.addChild planetSurfaceScene.views.viewportView.el
  ,
    onTick: (event) ->
      @views.entityManagerView.onTick event
      @views.minimapView.onTick event

      ###
      w = config.viewportOptions.width * config.tileWidth
      h = config.viewportOptions.height * config.tileHeight

      @views.entityManagerView.el.cache 0 - w, 0 - h, w * 3, h * 3
      ###

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
