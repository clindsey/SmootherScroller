require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Wolf.View', gamecore.Pooled.extend 'Wolf',
    create: (wolfModel, viewportModel) ->
      wolfView = @_super()

      wolfView.offsetX = 0
      wolfView.offsetY = 0
      wolfView.scrollX = 0
      wolfView.scrollY = 0

      wolfView.model = wolfModel

      wolfView.viewportModel = viewportModel

      wolfView.spriteSheet = new createjs.SpriteSheet @spriteSheetOptions

      wolfView.el = new createjs.Sprite wolfView.spriteSheet, 'sleepSouth'

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
        sleepSouth:
          frames: [320,321]
          speed: 0.1
  ,
    setPosition: ->
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
      @el.x = @intendedX + @scrollX
      @el.y = @intendedY + @scrollY

    dispose: ->
      EventBus.removeEventListener "!move:#{@viewportModel.uniqueId}", @setPosition, this

      @release()
