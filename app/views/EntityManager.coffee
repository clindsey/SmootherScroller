require 'config'
require 'utils'
require 'models/Creature'
require 'views/Creature'
require 'models/Plant'
require 'views/Plant'
require 'models/Building'
require 'views/Building'

config = moduleLibrary.get 'config'
utils = moduleLibrary.get 'utils'

# there probably needs to be an entity manager model, to handle things like population change

moduleLibrary.define 'EntityManager.View', gamecore.Pooled.extend 'EntityManagerView',
    create: (viewportModel) ->
      entityManagerView = @_super()

      entityManagerView.el = new createjs.Container

      entityManagerView.lastUpdate = 0

      entityManagerView.entityViews = []
      entityManagerView.entityModels = []

      entityManagerView.viewportModel = viewportModel

      entityManagerView
  ,
    onTick: (event) ->
      timeDelta = event.time - @lastUpdate

      if Math.floor(timeDelta / 500) >= 1
        _.each @entityModels, (entityModel) ->
          entityModel.tick()

        @lastUpdate = event.time

      # not happy with the way entities are being hidden when out of viewport bounds
      ###
      _.each @entityViews, (creatureView) ->
        if creatureView.el.x >= config.viewportOptions.width * config.tileWidth - config.tileWidth
          creatureView.el.visible = false
        else
          creatureView.el.visible = true
      ###

    addBuildings: (populationSize, tileMapModel) ->
      buildingCount = 0

      while buildingCount < populationSize
        s = config.sessionRandom += 1
        x = Math.floor utils.random(s) * config.worldTileWidth
        y = Math.floor utils.random(s + 1) * config.worldTileHeight
        color = if Math.floor(utils.random(s + 2) * 2) % 2 then 'Orange' else 'Blue'

        tile = tileMapModel.getCell x, y

        if tile is 1
          buildingCount += 1
          buildingModel = (moduleLibrary.get 'Building.Model').create x, y, color
          buildingView = (moduleLibrary.get 'Building.View').create buildingModel, @viewportModel

          @el.addChild buildingView.el
          @entityViews.push buildingView
          @entityModels.push buildingModel

    addPlants: (populationSize, tileMapModel) ->
      plantCount = 0

      while plantCount < populationSize
        s = config.sessionRandom += 1
        x = Math.floor utils.random(s) * config.worldTileWidth
        y = Math.floor utils.random(s + 1) * config.worldTileHeight

        tile = tileMapModel.getCell x, y

        if tile is 1
          plantCount += 1
          plantModel = (moduleLibrary.get 'Plant.Model').create x, y
          plantView = (moduleLibrary.get 'Plant.View').create plantModel, @viewportModel

          @el.addChild plantView.el
          @entityViews.push plantView
          @entityModels.push plantModel

    addCreatures: (populationSize, tileMapModel) ->
      creatureCount = 0

      while creatureCount < populationSize
        s = config.sessionRandom += 1
        x = Math.floor utils.random(s) * config.worldTileWidth
        y = Math.floor utils.random(s + 1) * config.worldTileHeight
        color = if Math.floor(utils.random(s + 2) * 2) % 2 then 'Orange' else 'Blue'

        tile = tileMapModel.getCell x, y

        if tile is 1
          creatureCount += 1
          creatureModel = (moduleLibrary.get 'Creature.Model').create x, y, color, tileMapModel
          creatureView = (moduleLibrary.get 'Creature.View').create creatureModel, @viewportModel

          @el.addChild creatureView.el
          @entityViews.push creatureView
          @entityModels.push creatureModel

    dispose: ->
      _.each @entityViews, (creatureView) ->
        creatureView.model.dispose()
        creatureView.dispose()

      @release()
