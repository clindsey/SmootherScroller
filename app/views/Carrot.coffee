require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Carrot.View', gamecore.Pooled.extend 'CarrotView',
    create: (carrotModel, viewportModel) ->
      carrotView = @_super()

      carrotView.offsetX = 0
      carrotView.offsetY = 0
      carrotView.scrollX = 0
      carrotView.scrollY = 0

      carrotView.model = carrotModel

      carrotView.viewportModel = viewportModel

      carrotView.spriteSheet = new createjs.SpriteSheet @spriteSheetOptions

      carrotView.el = new createjs.Sprite carrotView.spriteSheet, ('first second third fourth'.split(' '))[carrotModel.maturity]

      EventBus.addEventListener "!move:#{viewportModel.uniqueId}", carrotView.setPosition, carrotView

      carrotView.setPosition()

      _.bindAll carrotView, 'onTick'

      carrotView.el.addEventListener 'tick', carrotView.onTick

      carrotView

    spriteSheetOptions:
      images: [utils.tilesetImg]
      frames:
        width: config.tileWidth
        height: config.tileHeight
      animations:
        first:
          frames: [272]
        second:
          frames: [273]
        third:
          frames: [274]
        fourth:
          frames: [275]
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
      animation =  ('first second third fourth'.split(' '))[@model.maturity]

      @el.gotoAndPlay animation unless @el.currentAnimation is animation

      @el.x = @intendedX + @scrollX
      @el.y = @intendedY + @scrollY

    dispose: ->
      EventBus.removeEventListener "!move:#{@viewportModel.uniqueId}", @setPosition, this

      @release()
