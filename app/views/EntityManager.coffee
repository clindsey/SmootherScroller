require 'config'
require 'utils'
require 'models/Creature'
require 'views/Creature'

config = moduleLibrary.get 'config'
utils = moduleLibrary.get 'utils'

# there probably needs to be an entity manager model, to handle things like population change

moduleLibrary.define 'EntityManager.View', gamecore.Pooled.extend 'EntityManagerView',
    create: (viewportModel) ->
      entityManagerView = @_super()

      entityManagerView.el = new createjs.Container

      entityManagerView.lastUpdate = 0

      entityManagerView.creatureViews = []
      entityManagerView.creatureModels = []

      entityManagerView.viewportModel = viewportModel

      entityManagerView
  ,
    onTick: (event) ->
      timeDelta = event.time - @lastUpdate

      # not happy with the way entities are being hidden when out of viewport bounds

      if Math.floor(timeDelta / 500) >= 1
        _.each @creatureModels, (creatureModel) ->
          creatureModel.tick()

        @lastUpdate = event.time

      _.each @creatureViews, (creatureView) ->
        if creatureView.el.x >= config.viewportOptions.width * config.tileWidth - config.tileWidth
          creatureView.el.visible = false
        else
          creatureView.el.visible = true

    ###
    addCreatures: (populationSize, tileMapModel) ->
      creatureModel = (moduleLibrary.get 'Creature.Model').create 0, 10, tileMapModel
      creatureView = (moduleLibrary.get 'Creature.View').create creatureModel, @viewportModel

      @el.addChild creatureView.el
      @creatureViews.push creatureView
      @creatureModels.push creatureModel
    ###

    addCreatures: (populationSize, tileMapModel) ->
      creatureCount = 0
      s = config.seed

      while creatureCount < populationSize
        s += 1
        x = Math.floor utils.random(s) * config.worldTileWidth
        y = Math.floor utils.random(s + 1) * config.worldTileHeight

        tile = tileMapModel.getCell x, y

        if tile is 1
          creatureCount += 1
          creatureModel = (moduleLibrary.get 'Creature.Model').create x, y, tileMapModel
          creatureView = (moduleLibrary.get 'Creature.View').create creatureModel, @viewportModel

          @el.addChild creatureView.el
          @creatureViews.push creatureView
          @creatureModels.push creatureModel

    dispose: ->
      _.each @creatureViews, (creatureView) ->
        creatureView.model.dispose()
        creatureView.dispose()

      @release()
