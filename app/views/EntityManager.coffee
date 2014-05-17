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
      contentWidth = viewportModel.width * config.tileWidth * 3
      contentHeight = viewportModel.height * config.tileHeight * 3

      entityManagerView.lastUpdate = 0

      entityManagerView.scrollX = 0
      entityManagerView.scrollY = 0

      entityManagerView.entityViews = []
      entityManagerView.entityModels = []

      entityManagerView.permanentsLookup = {}

      entityManagerView.viewportModel = viewportModel

      EventBus.addEventListener "!move:#{viewportModel.uniqueId}", entityManagerView.setPosition, entityManagerView

      entityManagerView
  ,
    setPosition: ->
      _.each @entityViews, (entityView) ->
        entityView.setPosition()
        entityView.onTick()

    onTick: (event) ->
      timeDelta = event.time - @lastUpdate

      scrollX = @viewportModel.scrollX
      scrollY = @viewportModel.scrollY
      @el.x = scrollX + 640
      @el.y = scrollY + 480

      #@el.x = 0 - ((config.worldTileWidth / 2 - @viewportModel.width / 2) * config.tileWidth)
      #@el.y = 0 - ((config.worldTileHeight / 2 - @viewportModel.height / 2) * config.tileHeight)

      #newX += Math.floor(config.worldTileWidth / 4 + 4) * config.tileWidth # get rid of these magic numbers
      #newY += Math.floor(config.worldTileHeight / 4 - 1) * config.tileHeight

      if Math.floor(timeDelta / 500) >= 1
        _.each @entityModels, (entityModel) ->
          entityModel.tick()

        @lastUpdate = event.time

    addBuilding: (tileMapModel) ->
      x = Math.floor config.worldTileWidth / 2
      y = Math.floor config.worldTileHeight / 2
      color = 'Orange'

      buildingModel = (moduleLibrary.get 'Building.Model').create x, y, color
      buildingView = (moduleLibrary.get 'Building.View').create buildingModel, @viewportModel

      @el.addChild buildingView.el
      @entityViews.push buildingView
      @entityModels.push buildingModel

    addVillage: (populationSize, tileMapModel) ->
      buildingCount = 0

      while buildingCount < populationSize
        s = config.sessionRandom += 1
        x = Math.floor utils.random(s) * config.worldTileWidth
        y = Math.floor utils.random(s + 1) * config.worldTileHeight
        color = if Math.floor(utils.random(s + 2) * 2) % 2 then 'Orange' else 'Blue'

        tile = tileMapModel.getCell x, y

        if tile is 1 and @permanentsLookup["#{x}_#{y}"] isnt true
          buildingCount += 1
          buildingModel = (moduleLibrary.get 'Building.Model').create x, y, color
          buildingView = (moduleLibrary.get 'Building.View').create buildingModel, @viewportModel

          @el.addChild buildingView.el
          @entityViews.push buildingView
          @entityModels.push buildingModel

          @permanentsLookup["#{x}_#{y}"] = true

          plantModels = @addPlants 3, tileMapModel, buildingModel
          @addCreatures 1, tileMapModel, buildingModel, plantModels

    addCreatures: (populationSize, tileMapModel, buildingModel, plantModels) ->
      creatureCount = 0

      creatureModel = undefined

      while creatureCount < populationSize
        s = config.sessionRandom += 1
        x = buildingModel.x
        y = buildingModel.y
        color = if Math.floor(utils.random(s + 2) * 2) % 2 then 'Orange' else 'Blue'

        tile = tileMapModel.getCell x, y

        if tile is 1
          creatureCount += 1
          creatureModel = (moduleLibrary.get 'Creature.Model').create x, y, color, tileMapModel, buildingModel, plantModels
          creatureView = (moduleLibrary.get 'Creature.View').create creatureModel, @viewportModel

          @el.addChild creatureView.el
          @entityViews.push creatureView
          @entityModels.push creatureModel

    addPlants: (populationSize, tileMapModel, buildingModel) ->
      plantCount = 0
      giveupCounter = 20

      plantModels = []

      while plantCount < populationSize and giveupCounter
        s = config.sessionRandom += 1
        x = utils.clamp Math.floor(buildingModel.x + ((utils.random(s) * 20) - 10)), config.worldTileWidth
        y = utils.clamp Math.floor(buildingModel.y + ((utils.random(s += 1) * 20) - 10)), config.worldTileHeight

        tile = tileMapModel.getCell x, y

        if tile is 1 and @permanentsLookup["#{x}_#{y}"] isnt true
          path = tileMapModel.findPath buildingModel.x, buildingModel.y, x, y, 20, 20

          unless path.length
            giveupCounter -= 1
            continue

          plantModel = (moduleLibrary.get 'Plant.Model').create x, y
          plantView = (moduleLibrary.get 'Plant.View').create plantModel, @viewportModel

          plantCount += 1

          @el.addChild plantView.el
          @entityViews.push plantView
          @entityModels.push plantModel

          @permanentsLookup["#{x}_#{y}"] = true

          plantModels.push plantModel

      plantModels

    dispose: ->
      _.each @entityViews, (creatureView) ->
        creatureView.model.dispose()
        creatureView.dispose()

      @release()
