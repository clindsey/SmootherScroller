require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Wolf.View', gamecore.Pooled.extend 'Wolf',
    create: (wolfModel, viewportModel) ->
      wolfView = @_super()

      wolfView.offsetX = 0
      wolfView.offsetY = 0

      wolfView.model = wolfModel

      wolfView.viewportModel = viewportModel

      wolfView.spriteSheet = new createjs.SpriteSheet @spriteSheetOptions

      wolfView.el = new createjs.Sprite wolfView.spriteSheet, 'sleepSouth'

      EventBus.addEventListener "!move:#{wolfModel.uniqueId}", wolfView.onModelMove, wolfView
      EventBus.addEventListener "!move:#{viewportModel.uniqueId}", wolfView.setPosition, wolfView

      wolfView.setPosition()

      _.bindAll wolfView, 'onTick'

      wolfView.el.addEventListener 'tick', wolfView.onTick

      wolfView

    spriteSheetOptions:
      images: [utils.tilesetImg]
      frames:
        width: config.tileWidth
        height: config.tileHeight
      animations:
        restingEast:
          frames: [288,289,290,291]
          speed: 0.5
        restingNorth:
          frames: [292,293,294,295]
          speed: 0.5
        restingWest:
          frames: [296,297,298,299]
          speed: 0.5
        restingSouth:
          frames: [300,301,302,303]
          speed: 0.5
        workingSouth:
          frames: [320,321]
          speed: 0.1
        workingWest:
          frames: [322,323]
          speed: 0.1
        workingNorth:
          frames: [324,325]
          speed: 0.1
        workingEast:
          frames: [326,327]
          speed: 0.1
  ,
    onModelMove: ->
      dX = 0
      dY = 0

      switch @model.direction
        when 'North'
          dY = config.tileHeight
        when 'East'
          dX = 0 - config.tileWidth
        when 'South'
          dY = 0 - config.tileHeight
        when 'West'
          dX = config.tileWidth

      @offsetX = dX
      @offsetY = dY

      createjs.Tween.get(this).to {offsetX: 0, offsetY: 0}, 450

      @setPosition()

    setPosition: ->
      animation = "#{@model.stateMachine.current}#{@model.direction}"

      @el.gotoAndPlay animation unless @el.currentAnimation is animation

      centerX = Math.floor @viewportModel.width / 2
      centerY = Math.floor @viewportModel.height / 2

      viewX = @viewportModel.x
      viewY = @viewportModel.y

      myX = @model.x
      myY = @model.y

      x = (myX - viewX) + centerX
      y = (myY - viewY) + centerY

      worldWidth = config.worldTileWidth
      halfWorldWidth = Math.floor worldWidth / 2

      worldHeight = config.worldTileHeight
      halfWorldHeight = Math.floor worldHeight / 2

      offsetX = 0
      offsetY = 0

      if myX > viewX + halfWorldWidth
        offsetX -= worldWidth

      if myX < viewX - halfWorldWidth
        offsetX += worldWidth

      if myY > viewY + halfWorldHeight
        offsetY -= worldHeight

      if myY < viewY - halfWorldHeight
        offsetY += worldHeight

      myNewX = x + offsetX
      myNewY = y + offsetY

      newX = myNewX * config.tileWidth
      newY = myNewY * config.tileHeight

      @intendedX = newX
      @intendedY = newY

    onTick: ->
      @el.x = @intendedX + @offsetX
      @el.y = @intendedY + @offsetY

    dispose: ->
      EventBus.removeEventListener "!move:#{@viewportModel.uniqueId}", @setPosition, this
      EventBus.removeEventListener "!move:#{@model.uniqueId}", @onModelMove, this

      @release()
