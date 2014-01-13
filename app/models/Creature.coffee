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

      creatureModel.minimapColor = '#880000'

      creatureModel
  ,
    setPosition: (x, y) ->
      if y isnt @y or x isnt @x
        @x = x
        @y = y

        EventBus.dispatch "!move:#{@uniqueId}"

    tick: ->
      fountSpot = false
      giveUpCounter = 6

      while !foundSpot and giveUpCounter
        dX = 0
        dY = 0

        runOrRise = Math.floor(utils.sessionRandom() * 2) % 2

        if runOrRise
          dX = Math.floor(utils.sessionRandom() * 3) - 1
        else
          dY = Math.floor(utils.sessionRandom() * 3) - 1

        newX = utils.clamp @x + dX, config.worldTileWidth
        newY = utils.clamp @y + dY, config.worldTileHeight

        tile = @tileMapModel.getCell newX, newY

        newDirection = 'South'

        if dX > 0
          @direction = 'East'
        if dX < 0
          @direction = 'West'

        if dY > 0
          @direction = 'South'
        if dY < 0
          @direction = 'North'

        if tile is 1 and (newX isnt @x or newY isnt @y)
          @setPosition newX, newY

          foundSpot = true
        else
          giveUpCounter -= 1

    dispose: ->
      @release()
