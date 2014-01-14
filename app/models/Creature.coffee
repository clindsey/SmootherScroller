require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Creature.Model', gamecore.Pooled.extend 'CreatureModel',
    create: (x, y, color, tileMapModel) ->
      creatureModel = @_super()

      creatureModel.x = x
      creatureModel.y = y
      creatureModel.direction = 'South'
      creatureModel.color = color
      creatureModel.tileMapModel = tileMapModel

      creatureModel.moving = false

      creatureModel.minimapColor = '#880000'

      creatureModel
  ,
    setPosition: (x, y) ->
      if y isnt @y or x isnt @x
        @x = x
        @y = y

        EventBus.dispatch "!move:#{@uniqueId}"

    tick: ->
      unless @moving
        @getPath()
      else
        @followPath()

    getPath: ->
      fountSpot = false
      giveUpCounter = 6

      while !foundSpot and giveUpCounter
        dX = 0
        dY = 0

        dX = Math.floor(utils.sessionRandom() * 20) - 10
        dY = Math.floor(utils.sessionRandom() * 20) - 10

        newX = utils.clamp @x + dX, config.worldTileWidth
        newY = utils.clamp @y + dY, config.worldTileHeight

        path = @tileMapModel.findPath @x, @y, newX, newY, 10, 10

        if path.length
          @path = path

          foundSpot = true

          @moving = true
        else
          giveUpCounter -= 1

    followPath: ->
      path = @path

      nearRoad = path.shift()

      @path = path

      @moving = false unless @path.length

      return unless nearRoad? and !!nearRoad.length

      dX = nearRoad[0]
      dY = nearRoad[1]

      newX = utils.clamp @x + dX, config.worldTileWidth
      newY = utils.clamp @y + dY, config.worldTileHeight

      newDirection = 'South'

      if dX > 0
        @direction = 'East'
      if dX < 0
        @direction = 'West'

      if dY > 0
        @direction = 'South'
      if dY < 0
        @direction = 'North'

      @setPosition newX, newY

    dispose: ->
      @release()
