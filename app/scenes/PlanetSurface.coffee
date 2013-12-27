require 'models/Viewport'
require 'models/TileMap'
require 'config'

config = moduleLibrary.get 'config'

# due for refactor. should attach views dynamically
moduleLibrary.define 'PlanetSurface.Scene', gamecore.Pooled.extend 'PlanetSurfaceScene',
    create: ->
      planetSurfaceScene = @_super()

      planetSurfaceScene.el = new createjs.Container

      planetSurfaceScene.views = {}
      planetSurfaceScene.models = {}

      planetSurfaceScene.models['TileMap.Model'] = (moduleLibrary.get 'TileMap.Model').create config.generator.location, config.generator.name

      @createViewport planetSurfaceScene, planetSurfaceScene.models['TileMap.Model']

      planetSurfaceScene

    createViewport: (planetSurfaceScene, tileMapModel) ->
      planetSurfaceScene.models['Viewport.Model'] = (moduleLibrary.get 'Viewport.Model').create 0, 0, config.viewportOptions.width, config.viewportOptions.height
      planetSurfaceScene.views['Viewport.View'] = (moduleLibrary.get 'Viewport.View').create planetSurfaceScene.models['Viewport.Model'], tileMapModel

      planetSurfaceScene.el.addChild planetSurfaceScene.views['Viewport.View'].el
  ,
    dispose: ->
      @release()
