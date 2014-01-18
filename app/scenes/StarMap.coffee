require 'utils'
require 'config'
require 'models/Planet'
require 'views/Planet'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

PlanetModel = moduleLibrary.get 'Planet.Model'
PlanetView = moduleLibrary.get 'Planet.View'

moduleLibrary.define 'StarMap.Scene', gamecore.Pooled.extend 'StarMapScene',
    create: ->
      starMapScene = @_super()

      starMapScene.el = new createjs.Container

      starMapScene.views = {}
      starMapScene.models = {}

      @addBackground starMapScene

      @addPlanets starMapScene

      starMapScene

    addPlanets: (starMapScene) ->
      seed = config.seed

      seed += 1

      planetModel = PlanetModel.create seed
      planetView = PlanetView.create planetModel

      planetView.el.x = 152
      planetView.el.y = 112

      starMapScene.el.addChild planetView.el

    addBackground: (starMapScene) ->
      el = new createjs.Bitmap utils.tilesetImg

      starMapScene.backgroundEl = el

      el.sourceRect = new createjs.Rectangle 0, 352, 320, 240

      starMapScene.el.addChild el
  ,
    dispose: ->
      @release()
