require 'utils'
require 'config'
require 'models/Planet'
require 'views/Planet'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

PlanetModel = moduleLibrary.get 'Planet.Model'
PlanetView = moduleLibrary.get 'Planet.View'

moduleLibrary.define 'StarMap.Scene', gamecore.Pooled.extend 'StarMapScene',
    create: (seed, sessionRandom) ->
      starMapScene = @_super()
      starMapScene.seed = seed

      starMapScene.el = new createjs.Container

      starMapScene.views = {}
      starMapScene.models = {}

      @addBackground starMapScene

      @addPlanets starMapScene

      starMapScene

    addPlanets: (starMapScene) ->
      halfWidth = Math.floor config.tileWidth / 2
      halfHeight = Math.floor config.tileHeight / 2

      seed = starMapScene.seed

      for y in [0..2]
        for x in [0..2]
          seed += 1

          planetModel = PlanetModel.create seed
          planetView = PlanetView.create planetModel

          planetView.el.x = (x * 80) - halfWidth + 80
          planetView.el.y = (y * 70) - halfHeight + 40

          starMapScene.el.addChild planetView.el

    addBackground: (starMapScene) ->
      el = new createjs.Bitmap utils.tilesetImg

      starMapScene.backgroundEl = el

      el.sourceRect = new createjs.Rectangle 0, 352, 320, 240

      starMapScene.el.addChild el
  ,
    dispose: ->
      @release()
