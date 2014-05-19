require 'config'
require 'utils'
require 'models/Carrot'
require 'views/Carrot'
require 'models/Rabbit'
require 'views/Rabbit'
require 'models/Wolf'
require 'views/Wolf'

config = moduleLibrary.get 'config'
utils = moduleLibrary.get 'utils'

# there probably needs to be an entity manager model, to handle things like population change

moduleLibrary.define 'EntityManager.View', gamecore.Pooled.extend 'EntityManagerView',
    create: (viewportModel, tileMapModel) ->
      entityManagerView = @_super()

      entityManagerView.el = new createjs.Container
      entityManagerView.carrotLayerEl = new createjs.Container
      entityManagerView.el.addChild entityManagerView.carrotLayerEl
      entityManagerView.rabbitLayerEl = new createjs.Container
      entityManagerView.el.addChild entityManagerView.rabbitLayerEl
      entityManagerView.wolfLayerEl = new createjs.Container
      entityManagerView.el.addChild entityManagerView.wolfLayerEl

      entityManagerView.lastUpdate = 0

      entityManagerView.proximityManager = new ProximityManager config.generator.options.worldChunkWidth, config.generator.options.worldChunkHeight, config.worldTileWidth, config.worldTileHeight

      entityManagerView.scrollX = 0
      entityManagerView.scrollY = 0

      entityManagerView.entityViews = []
      entityManagerView.entityModels = []
      entityManagerView.carrotModels = []

      entityManagerView.carrotCount = 0
      entityManagerView.carrotGenesisCounter = 10

      entityManagerView.tickCounter = 0

      entityManagerView.permanentsLookup = {}

      entityManagerView.viewportModel = viewportModel
      entityManagerView.tileMapModel = tileMapModel

      EventBus.addEventListener "!move:#{viewportModel.uniqueId}", entityManagerView.setPosition, entityManagerView

      entityManagerView
  ,
    spawnRabbit: (parentRabbitModel) ->
      x = parentRabbitModel.x
      y = parentRabbitModel.y

      rabbitModel = (moduleLibrary.get 'Rabbit.Model').create x, y, parentRabbitModel.tileMapModel, this
      rabbitView = (moduleLibrary.get 'Rabbit.View').create rabbitModel, @viewportModel

      @rabbitLayerEl.addChild rabbitView.el
      @entityViews.push rabbitView
      @entityModels.push rabbitModel

    removeRabbit: (rabbitModel) ->
      entityViewIndex = (index for view, index in @entityViews when view.model is rabbitModel)[0]
      entityModelIndex = (index for model, index in @entityModels when model is rabbitModel)[0]

      if entityViewIndex isnt undefined
        @rabbitLayerEl.removeChild @entityViews[entityViewIndex].el

        @entityViews[entityViewIndex].dispose()
        @entityModels[entityModelIndex].dispose()

        @entityViews.splice entityViewIndex, 1
        @entityModels.splice entityModelIndex, 1

        return true

      false

    removeCarrot: (carrotModel) ->
      entityViewIndex = (index for view, index in @entityViews when view.model is carrotModel)[0]
      entityModelIndex = (index for model, index in @entityModels when model is carrotModel)[0]
      carrotModelIndex = (index for model, index in @carrotModels when model is carrotModel)[0]

      if entityViewIndex isnt undefined
        x = carrotModel.x
        y = carrotModel.y
        delete @permanentsLookup["#{x}_#{y}"]
        @carrotCount -= 1

        @proximityManager.removeEntity @entityModels[entityModelIndex]
        @proximityManager.refresh()

        @carrotLayerEl.removeChild @entityViews[entityViewIndex].el

        @entityViews[entityViewIndex].dispose()
        @entityModels[entityModelIndex].dispose()

        @entityViews.splice entityViewIndex, 1
        @entityModels.splice entityModelIndex, 1
        @carrotModels.splice carrotModelIndex, 1

        return true

      false

    setPosition: ->
      _.each @entityViews, (entityView) ->
        entityView.setPosition()
        entityView.onTick()

    onTick: (event) ->
      timeDelta = event.time - @lastUpdate

      scrollX = @viewportModel.scrollX
      scrollY = @viewportModel.scrollY
      @el.x = scrollX
      @el.y = scrollY

      if Math.floor(timeDelta / 500) >= 1
        _.each @entityModels, (entityModel) ->
          entityModel.tick()

        @lastUpdate = event.time

        @carrotGenesisCounter -= 1
        if @carrotGenesisCounter < 0
          @carrotGenesisCounter = 10
          if @carrotCount < 100
            diff = 100 - @carrotCount
            size = Math.floor diff / 2
            @addCarrots size, @tileMapModel, 0, 20

    addCarrots: (populationSize, tileMapModel, maturity, maturityCount) ->
      carrotCount = 0

      while carrotCount < populationSize
        s = config.sessionRandom += 3
        x = Math.floor utils.random(s) * config.worldTileWidth
        y = Math.floor utils.random(s + 1) * config.worldTileHeight
        m = if maturity? then maturity else Math.floor utils.random(s + 2) * 4
        mC = if maturityCount? then maturityCount else Math.floor utils.random(s + 3) * 18 + 1

        tile = tileMapModel.getTile x, y

        if tile is 255 and @permanentsLookup["#{x}_#{y}"] isnt true
          carrotCount += 1
          carrotModel = (moduleLibrary.get 'Carrot.Model').create x, y, m, mC
          carrotView = (moduleLibrary.get 'Carrot.View').create carrotModel, @viewportModel

          @carrotLayerEl.addChild carrotView.el
          @entityViews.push carrotView
          @entityModels.push carrotModel
          @carrotModels.push carrotModel

          @proximityManager.addEntity carrotModel

          @permanentsLookup["#{x}_#{y}"] = true

      @carrotCount += carrotCount

      @proximityManager.refresh()

    addRabbits: (populationSize, tileMapModel) ->
      rabbitCount = 0

      while rabbitCount < populationSize
        s = config.sessionRandom += 1
        x = Math.floor utils.random(s) * config.worldTileWidth
        y = Math.floor utils.random(s + 1) * config.worldTileHeight

        tile = tileMapModel.getTile x, y

        if tile is 255# and @permanentsLookup["#{x}_#{y}"] isnt true
          rabbitCount += 1
          rabbitModel = (moduleLibrary.get 'Rabbit.Model').create x, y, tileMapModel, this
          rabbitView = (moduleLibrary.get 'Rabbit.View').create rabbitModel, @viewportModel

          @rabbitLayerEl.addChild rabbitView.el
          @entityViews.push rabbitView
          @entityModels.push rabbitModel

          #@permanentsLookup["#{x}_#{y}"] = true

    addWolves: (populationSize, tileMapModel) ->
      wolfCount = 0

      while wolfCount < populationSize
        s = config.sessionRandom += 1
        x = Math.floor utils.random(s) * config.worldTileWidth
        y = Math.floor utils.random(s + 1) * config.worldTileHeight

        tile = tileMapModel.getTile x, y

        if tile is 255# and @permanentsLookup["#{x}_#{y}"] isnt true
          wolfCount += 1
          wolfModel = (moduleLibrary.get 'Wolf.Model').create x, y, tileMapModel, this
          wolfView = (moduleLibrary.get 'Wolf.View').create wolfModel, @viewportModel

          @wolfLayerEl.addChild wolfView.el
          @entityViews.push wolfView
          @entityModels.push wolfModel

          #@permanentsLookup["#{x}_#{y}"] = true

    dispose: ->
      _.each @entityViews, (creatureView) ->
        creatureView.model.dispose()
        creatureView.dispose()

      @release()

class ProximityManager
  constructor: (@gridWidth, @gridHeight, totalWidth, totalHeight) ->
    @worldWidth = totalWidth / @gridWidth
    @worldHeight = totalHeight / @gridHeight
    @entities = {}
    @positions = []
    @cachedResults = []

  addEntity: (entityModel) ->
    @entities[entityModel.uniqueId] = entityModel

  removeEntity: (entityModel) ->
    delete @entities[entityModel.uniqueId]

  getNeighbors: (entityModel) ->
    x = Math.floor entityModel.x / @gridWidth
    y = Math.floor entityModel.y / @gridHeight
    index = y * @worldWidth + x

    results = @positions[index] or []

    clamp = (index, size) -> (index + size) % size
    cX = (index) => clamp index, @worldWidth
    cY = (index) => clamp index, @worldHeight
    addResult = (index) => results = results.concat(@positions[index]) if @positions[index]
    toIndex = (x, y) => cY(y) * @worldWidth + cX(x)

    addResult toIndex x - 1, y - 1
    addResult toIndex x, y - 1
    addResult toIndex x + 1, y - 1

    addResult toIndex x - 1, y
    addResult toIndex x + 1, y

    addResult toIndex x - 1, y + 1
    addResult toIndex x, y + 1
    addResult toIndex x + 1, y + 1

    @cachedResults = []

    results

  refresh: ->
    @positions = []

    for uniqueId, entityModel of @entities
      x = Math.floor entityModel.x / @gridWidth
      y = Math.floor entityModel.y / @gridHeight
      index = y * @worldWidth + x

      if @positions[index] is undefined
        @positions[index] = [entityModel]
      else
        @positions[index].push entityModel

    @cachedResults = []
