require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Building.View', gamecore.Pooled.extend 'BuildingView',
    create: (buildingModel, viewportModel) ->
      buildingView = @_super()

      buildingView.offsetX = 0
      buildingView.offsetY = 0
      buildingView.scrollX = 0
      buildingView.scrollY = 0

      buildingView.model = buildingModel

      buildingView.viewportModel = viewportModel

      buildingView.spriteSheet = new createjs.SpriteSheet @spriteSheetOptions

      buildingView.el = new createjs.Sprite buildingView.spriteSheet

      buildingView.el.gotoAndPlay 'first'

      EventBus.addEventListener "!move:#{viewportModel.uniqueId}", buildingView.setPosition, buildingView
      EventBus.addEventListener "!scroll:#{viewportModel.uniqueId}", buildingView.setScroll, buildingView

      buildingView.setPosition()

      _.bindAll buildingView, 'onTick'

      buildingView.el.addEventListener 'tick', buildingView.onTick

      buildingView

    spriteSheetOptions:
      images: [utils.tilesetImg]
      frames:
        width: config.tileWidth
        height: config.tileHeight
      animations:
        firstBlue:
          frames: [544]
        firstOrange:
          frames: [554]
  ,
    setScroll: ->
      @scrollX = @viewportModel.scrollX
      @scrollY = @viewportModel.scrollY

    setPosition: ->
      animation = "first#{@model.color}"

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
      @el.x = @intendedX + @scrollX
      @el.y = @intendedY + @scrollY

    dispose: ->
      EventBus.removeEventListener "!move:#{@viewportModel.uniqueId}", @setPosition, this

      @release()
