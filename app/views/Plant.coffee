require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Plant.View', gamecore.Pooled.extend 'PlantView',
    create: (plantModel, viewportModel) ->
      plantView = @_super()

      plantView.offsetX = 0
      plantView.offsetY = 0
      plantView.scrollX = 0
      plantView.scrollY = 0

      plantView.model = plantModel

      plantView.viewportModel = viewportModel

      plantView.spriteSheet = new createjs.SpriteSheet @spriteSheetOptions

      plantView.el = new createjs.Sprite plantView.spriteSheet

      plantView.el.gotoAndPlay 'first'

      EventBus.addEventListener "!move:#{viewportModel.uniqueId}", plantView.setPosition, plantView
      #EventBus.addEventListener "!scroll:#{viewportModel.uniqueId}", plantView.setScroll, plantView

      plantView.setPosition()

      _.bindAll plantView, 'onTick'

      plantView.el.addEventListener 'tick', plantView.onTick

      plantView

    spriteSheetOptions:
      images: [utils.tilesetImg]
      frames:
        width: config.tileWidth
        height: config.tileHeight
      animations:
        first:
          frames: [549]
  ,
    setScroll: ->
      @scrollX = @viewportModel.scrollX
      @scrollY = @viewportModel.scrollY

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
