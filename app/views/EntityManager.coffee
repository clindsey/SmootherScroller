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
    create: (viewportModel) ->
      entityManagerView = @_super()

      entityManagerView.el = new createjs.Container
      contentWidth = viewportModel.width * config.tileWidth * 3
      contentHeight = viewportModel.height * config.tileHeight * 3

      entityManagerView.lastUpdate = 0

      entityManagerView.proximityManager = new ProximityManager 20, 20, config.worldTileWidth, config.worldTileHeight

      entityManagerView.scrollX = 0
      entityManagerView.scrollY = 0

      entityManagerView.entityViews = []
      entityManagerView.entityModels = []
      entityManagerView.carrotModels = []

      entityManagerView.permanentsLookup = {}

      entityManagerView.viewportModel = viewportModel

      EventBus.addEventListener "!move:#{viewportModel.uniqueId}", entityManagerView.setPosition, entityManagerView

      entityManagerView
  ,
    removeCarrot: (carrotModel) ->
      entityViewIndex = (index for view, index in @entityViews when view.model is carrotModel)[0]
      entityModelIndex = (index for model, index in @entityModels when model is carrotModel)[0]
      carrotModelIndex = (index for model, index in @carrotModels when model is carrotModel)[0]

      if entityViewIndex isnt undefined
        @proximityManager.removeItem @entityModels[entityModelIndex]
        @proximityManager.refresh()

        @el.removeChild @entityViews[entityViewIndex].el

        @entityViews[entityViewIndex].dispose()
        @entityModels[entityModelIndex].dispose()

        @entityViews.splice entityViewIndex, 1
        @entityModels.splice entityModelIndex, 1
        @carrotModels.splice carrotModelIndex, 1

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

    addCarrots: (populationSize, tileMapModel) ->
      carrotCount = 0

      while carrotCount < populationSize
        s = config.sessionRandom += 1
        x = Math.floor utils.random(s) * config.worldTileWidth
        y = Math.floor utils.random(s + 1) * config.worldTileHeight

        tile = tileMapModel.getTile x, y

        if tile is 255 and @permanentsLookup["#{x}_#{y}"] isnt true
          carrotCount += 1
          carrotModel = (moduleLibrary.get 'Carrot.Model').create x, y
          carrotView = (moduleLibrary.get 'Carrot.View').create carrotModel, @viewportModel

          @el.addChild carrotView.el
          @entityViews.push carrotView
          @entityModels.push carrotModel
          @carrotModels.push carrotModel

          @proximityManager.addItem carrotModel

          @permanentsLookup["#{x}_#{y}"] = true

      @proximityManager.refresh()

    addRabbits: (populationSize, tileMapModel) ->
      rabbitCount = 0

      while rabbitCount < populationSize
        s = config.sessionRandom += 1
        x = Math.floor utils.random(s) * config.worldTileWidth
        y = Math.floor utils.random(s + 1) * config.worldTileHeight

        tile = tileMapModel.getTile x, y

        if tile is 255 and @permanentsLookup["#{x}_#{y}"] isnt true
          rabbitCount += 1
          rabbitModel = (moduleLibrary.get 'Rabbit.Model').create x, y, tileMapModel, this
          rabbitView = (moduleLibrary.get 'Rabbit.View').create rabbitModel, @viewportModel

          @el.addChild rabbitView.el
          @entityViews.push rabbitView
          @entityModels.push rabbitModel

          @permanentsLookup["#{x}_#{y}"] = true

    addWolves: (populationSize, tileMapModel) ->
      wolfCount = 0

      while wolfCount < populationSize
        s = config.sessionRandom += 1
        x = Math.floor utils.random(s) * config.worldTileWidth
        y = Math.floor utils.random(s + 1) * config.worldTileHeight

        tile = tileMapModel.getTile x, y

        if tile is 255 and @permanentsLookup["#{x}_#{y}"] isnt true
          wolfCount += 1
          wolfModel = (moduleLibrary.get 'Wolf.Model').create x, y, tileMapModel, this
          wolfView = (moduleLibrary.get 'Wolf.View').create wolfModel, @viewportModel

          @el.addChild wolfView.el
          @entityViews.push wolfView
          @entityModels.push wolfModel

          @permanentsLookup["#{x}_#{y}"] = true

    dispose: ->
      _.each @entityViews, (creatureView) ->
        creatureView.model.dispose()
        creatureView.dispose()

      @release()

class ProximityManager
  constructor: (@gridWidth, @gridHeight, @worldTileWidth, @worldTileHeight) ->
    @displayObjects = {}
    @positions = []
    @cachedResults = []

  getNeighbors: (displayObject) ->
    dX = displayObject.x
    dY = displayObject.y
    gW = @gridWidth
    gH = @gridHeight
    wW = @worldTileWidth
    wH = @worldTileHeight

    cX = (x) -> utils.clamp x, wW
    cY = (y) -> utils.clamp y, wH
    getIndex = (x, y) -> (Math.floor cY(y) / gH) * gW + (cX(x) % gW)

    index = getIndex dX, dY

    if @cachedResults[index]
      return @cachedResults[index]

    p = @positions
    r = p[index]

    if r is undefined
      r = []

    addResult = (i) -> r = r.concat(p[i]) if p[i]

    addResult getIndex dX - 1, dY - 1 # north west
    addResult getIndex dX, dY - 1 # north
    addResult getIndex dX + 1, dY - 1 # north east

    addResult getIndex dX - 1, dY # west
    addResult getIndex dX + 1, dY # east

    addResult getIndex dX - 1, dY + 1 # south west
    addResult getIndex dX, dY + 1 # south
    addResult getIndex dX + 1, dY + 1 # south east

    @cachedResults[index] = r

    r

  addItem: (displayObject) ->
    @displayObjects[displayObject] = displayObject

  removeItem: (displayObject) ->
    delete @displayObjects[displayObject]

  refresh: ->
    m = @displayObjects
    p = []

    for _key, displayObject of m
      gX = displayObject.x % @gridWidth
      gY = Math.floor displayObject.y / @gridHeight
      index = gY * @gridWidth + gX

      if p[index] is undefined
        p[index] = [displayObject]
        continue

      p[index].push displayObject

    @cachedResults = []
    @positions = p
