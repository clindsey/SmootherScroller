require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Wolf.Model', gamecore.Pooled.extend 'WolfModel',
    create: (x, y, tileMapModel, entityManagerView) ->
      wolfModel = @_super()

      wolfModel.x = x
      wolfModel.y = y
      wolfModel.path = []
      wolfModel.direction = 'South'
      wolfModel.tileMapModel = tileMapModel
      wolfModel.entityManagerView = entityManagerView
      wolfModel.moving = false
      wolfModel.stateMachine = @stateMachine wolfModel
      wolfModel.minimapColor = '#b03c25'

      wolfModel

    stateMachine: (wolfModel) ->
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
            result = wolfModel.getPathToNearestRabbit()
            path = result.path

            if path.length
              wolfModel.path = path
              wolfModel.moving = true
              wolfModel.targetRabbit = result.model

          onwork: ->
            if wolfModel.path.length <= 1 and wolfModel.targetRabbit
              wolfModel.targetRabbit.energy -= 2
  ,
    getPathToNearestRabbit: ->
      rabbitProximityManager = @entityManagerView.rabbitProximityManager
      rabbitModels = rabbitProximityManager.getNeighbors this

      shortestPath = []
      nearestRabbit = undefined

      for rabbitModel in rabbitModels
        path = @getPath rabbitModel

        if path.length > 1
          if shortestPath.length is 0
            shortestPath = path
            nearestRabbit = rabbitModel
          else if path.length < shortestPath.length
            shortestPath = path
            nearestRabbit = rabbitModel

      {path: shortestPath, model: nearestRabbit}

    setPosition: (x, y) ->
      if x isnt @x or y isnt @y
        @x = x
        @y = y

        EventBus.dispatch "!move:#{@uniqueId}"

    tick: ->
      if @moving
        @followPath()
        @stateMachine.work()
        @stateMachine.rest()
      else
        switch @stateMachine.current
          when 'working'
            @stateMachine.rest()
          when 'resting'
            @stateMachine.work()

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
