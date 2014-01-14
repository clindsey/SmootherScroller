require 'models/Viewport'
require 'models/TileMap'
require 'config'
require 'views/EntityManager'
require 'views/Minimap'

config = moduleLibrary.get 'config'

# due for refactor. should attach views dynamically
# the name for the models and views here is just stupid
moduleLibrary.define 'PlanetSurface.Scene', gamecore.Pooled.extend 'PlanetSurfaceScene',
    create: ->
      planetSurfaceScene = @_super()

      planetSurfaceScene.el = new createjs.Container

      planetSurfaceScene.views = {}
      planetSurfaceScene.models = {}

      planetSurfaceScene.models['TileMap.Model'] = (moduleLibrary.get 'TileMap.Model').create config.generator.location, config.generator.name, config.generator.options

      planetSurfaceScene.models['TileMap.Model'].cacheAllTiles()

      @createViewport planetSurfaceScene, planetSurfaceScene.models['TileMap.Model']

      planetSurfaceScene.views['EntityManager.View'] = (moduleLibrary.get 'EntityManager.View').create planetSurfaceScene.models['Viewport.Model']

      planetSurfaceScene.el.addChild planetSurfaceScene.views['EntityManager.View'].el
      planetSurfaceScene.views['EntityManager.View'].addPlants 60, planetSurfaceScene.models['TileMap.Model']
      planetSurfaceScene.views['EntityManager.View'].addCreatures 20, planetSurfaceScene.models['TileMap.Model']
      planetSurfaceScene.views['EntityManager.View'].addBuildings 20, planetSurfaceScene.models['TileMap.Model']

      planetSurfaceScene.views['Minimap.View'] = (moduleLibrary.get 'Minimap.View').create planetSurfaceScene.models['TileMap.Model'], planetSurfaceScene.views['EntityManager.View'], planetSurfaceScene.models['Viewport.Model']
      planetSurfaceScene.el.addChild planetSurfaceScene.views['Minimap.View'].el

      _.bindAll planetSurfaceScene, 'onTick'
      createjs.Ticker.addEventListener 'tick', planetSurfaceScene.onTick

      planetSurfaceScene

    createViewport: (planetSurfaceScene, tileMapModel) ->
      viewportX = Math.floor config.worldTileWidth / 2
      viewportY = Math.floor config.worldTileHeight / 2

      planetSurfaceScene.models['Viewport.Model'] = (moduleLibrary.get 'Viewport.Model').create viewportX, viewportY, config.viewportOptions.width, config.viewportOptions.height
      planetSurfaceScene.views['Viewport.View'] = (moduleLibrary.get 'Viewport.View').create planetSurfaceScene.models['Viewport.Model'], tileMapModel

      planetSurfaceScene.el.addChild planetSurfaceScene.views['Viewport.View'].el
  ,
    onTick: (event) ->
      @views['EntityManager.View'].onTick event
      @views['Minimap.View'].onTick event

      @views['EntityManager.View'].el.cache 0, 0, config.viewportOptions.width * config.tileWidth, config.viewportOptions.height * config.tileHeight

    dispose: ->
      _.invoke planetSurfaceScene.views, 'dispose'
      _.invoke planetSurfaceScene.models, 'dispose'

      @release()
