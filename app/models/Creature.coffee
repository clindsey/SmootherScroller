require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Creature.Model', gamecore.Pooled.extend 'CreatureModel',
    create: (x, y, color, tileMapModel, buildingModel, plantModels) ->
      creatureModel = @_super()

      creatureModel.x = x
      creatureModel.y = y
      creatureModel.direction = 'South'
      creatureModel.color = color
      creatureModel.tileMapModel = tileMapModel
      creatureModel.buildingModel = buildingModel
      creatureModel.plantModels = plantModels
      creatureModel.plantIndex = 0

      creatureModel.moving = false

      creatureModel.minimapColor = '#880000'

      creatureModel.stateMachine = @stateMachine creatureModel

      creatureModel

    stateMachine: (creatureModel) ->
      StateMachine.create
        initial: 'resting'
        events: [
            name: 'work'
            from: 'resting'
            to: 'working'
          ,
            name: 'work'
            from: 'working'
            to: 'working'
          ,
            name: 'rest'
            from: 'working'
            to: 'resting'
        ]
        callbacks:
          onrest: ->
            creatureModel.path = creatureModel.getPath creatureModel.plantModels[creatureModel.plantIndex]

          onwork: ->
            creatureModel.path = creatureModel.getPath creatureModel.plantModels[creatureModel.plantIndex]

            creatureModel.plantIndex += 1

            if creatureModel.plantIndex > creatureModel.plantModels.length - 1
              creatureModel.plantIndex = 0

              creatureModel.path = creatureModel.getPath creatureModel.buildingModel
  ,
    setPosition: (x, y) ->
      if y isnt @y or x isnt @x
        @x = x
        @y = y

        EventBus.dispatch "!move:#{@uniqueId}"

    tick: ->
      if @moving
        @followPath()
      else
        switch @stateMachine.current
          when 'working'
            @stateMachine.rest()
          when 'resting'
            @stateMachine.work()

    getPath: (targetModel) ->
      path = @tileMapModel.findPath @x, @y, targetModel.x, targetModel.y, 60, 60

      @moving = true

      path

    followPath: ->
      path = @path

      nearRoad = path.shift()

      @path = path

      unless @path.length
        @moving = false

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
