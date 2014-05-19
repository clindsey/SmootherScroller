require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Rabbit.Model', gamecore.Pooled.extend 'RabbitModel',
    create: (x, y, tileMapModel, entityManagerView) ->
      rabbitModel = @_super()

      rabbitModel.x = x
      rabbitModel.y = y
      rabbitModel.energy = 15
      rabbitModel.eatCount = 0
      rabbitModel.direction = 'South'
      rabbitModel.tileMapModel = tileMapModel
      rabbitModel.entityManagerView = entityManagerView
      rabbitModel.minimapColor = '#ff9600'
      rabbitModel.moving = false
      rabbitModel.stateMachine = @stateMachine rabbitModel

      rabbitModel

    stateMachine: (rabbitModel) ->
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
            result = rabbitModel.getPathToNearestCarrot()
            path = result.path

            if path.length
              rabbitModel.path = path
              rabbitModel.moving = true
              rabbitModel.targetCarrot = result.model

          onwork: ->
            ateCarrot = rabbitModel.entityManagerView.removeCarrot rabbitModel.targetCarrot

            if ateCarrot
              rabbitModel.energy += 10

              rabbitModel.eatCount += 1
              if rabbitModel.eatCount % 2 is 0
                rabbitModel.entityManagerView.spawnRabbit rabbitModel
  ,
    getPathToNearestCarrot: ->
      carrotProximityManager = @entityManagerView.carrotProximityManager
      carrotModels = carrotProximityManager.getNeighbors this

      shortestPath = []
      nearestCarrot = undefined

      for carrotModel in carrotModels
        continue if carrotModel.marked
        continue if carrotModel.maturity < 3

        path = @getPath carrotModel

        if path.length > 1
          if shortestPath.length is 0
            shortestPath = path
            nearestCarrot = carrotModel
          else if path.length < shortestPath.length
            shortestPath = path
            nearestCarrot = carrotModel

      nearestCarrot.marked = true if nearestCarrot isnt undefined
      {path: shortestPath, model: nearestCarrot}

    setPosition: (x, y) ->
      if x isnt @x or y isnt @y
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
            if @energy < 30
              @stateMachine.work()

      @energy -= 1
      if @energy < 0
        @targetCarrot.marked = false if @targetCarrot
        @targetCarrot = undefined
        @entityManagerView.removeRabbit this

    getPath: (targetModel) ->
      path = @tileMapModel.findPath @x, @y, targetModel.x, targetModel.y, 60, 60

      path

    followPath: ->
      path = @path

      nearPath = path.shift()

      @path = path

      unless @path.length
        @moving = false

      return unless nearPath? and !!nearPath.length

      dX = nearPath[0]
      dY = nearPath[1]

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
