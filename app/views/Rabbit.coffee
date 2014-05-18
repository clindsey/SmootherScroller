require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Rabbit.View', gamecore.Pooled.extend 'RabbitView',
    create: (rabbitModel, viewportModel) ->
      rabbitView = @_super()

      rabbitView.offsetX = 0
      rabbitView.offsetY = 0

      rabbitView.model = rabbitModel

      rabbitView.viewportModel = viewportModel

      rabbitView.spriteSheet = new createjs.SpriteSheet @spriteSheetOptions

      rabbitView.el = new createjs.Sprite rabbitView.spriteSheet, 'walkEast'

      EventBus.addEventListener "!move:#{rabbitModel.uniqueId}", rabbitView.onModelMove, rabbitView
      EventBus.addEventListener "!move:#{viewportModel.uniqueId}", rabbitView.setPosition, rabbitView

      rabbitView.setPosition()

      _.bindAll rabbitView, 'onTick'

      rabbitView.el.addEventListener 'tick', rabbitView.onTick

      rabbitView

    spriteSheetOptions:
      images: [utils.tilesetImg]
      frames:
        width: config.tileWidth
        height: config.tileHeight
      animations:
        restingEast:
          frames: [304,305,306,307]
          speed: 0.5
        restingNorth:
          frames: [308,309,310,311]
          speed: 0.5
        restingWest:
          frames: [312,313,314,315]
          speed: 0.5
        restingSouth:
          frames: [316,317,318,319]
          speed: 0.5
        workingSouth:
          frames: [328,329]
          speed: 0.1
        workingWest:
          frames: [330,331]
          speed: 0.1
        workingNorth:
          frames: [332,333]
          speed: 0.1
        workingEast:
          frames: [334,335]
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
