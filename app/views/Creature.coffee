require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Creature.View', gamecore.Pooled.extend 'CreatureView',
    create: (creatureModel, viewportModel) ->
      creatureView = @_super()

      creatureView.offsetX = 0
      creatureView.offsetY = 0
      creatureView.scrollX = 0
      creatureView.scrollY = 0

      creatureView.model = creatureModel

      creatureView.viewportModel = viewportModel

      creatureView.spriteSheet = new createjs.SpriteSheet @spriteSheetOptions

      creatureView.el = new createjs.Sprite creatureView.spriteSheet

      creatureView.el.gotoAndPlay 'walkSouth'

      EventBus.addEventListener "!move:#{creatureModel.uniqueId}", creatureView.onModelMove, creatureView
      EventBus.addEventListener "!move:#{viewportModel.uniqueId}", creatureView.setPosition, creatureView
      #EventBus.addEventListener "!scroll:#{viewportModel.uniqueId}", creatureView.setScroll, creatureView

      creatureView.setPosition()

      _.bindAll creatureView, 'onTick'

      creatureView.el.addEventListener 'tick', creatureView.onTick

      creatureView.el.x = creatureView.intendedX
      creatureView.el.y = creatureView.intendedY

      creatureView

    spriteSheetOptions:
      images: [utils.tilesetImg]
      frames:
        width: config.tileWidth
        height: config.tileHeight
      animations:
        walkEastBlue:
          frames: [576, 577, 578, 579]
        walkNorthBlue:
          frames: [580, 581, 582, 583]
        walkWestBlue:
          frames: [584, 585, 586, 587]
        walkSouthBlue:
          frames: [588, 589, 590, 591]
        walkEastOrange:
          frames: [608, 609, 610, 611]
        walkNorthOrange:
          frames: [612, 613, 614, 615]
        walkWestOrange:
          frames: [616, 617, 618, 619]
        walkSouthOrange:
          frames: [620, 621, 622, 623]
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

    setScroll: ->
      @scrollX = @viewportModel.scrollX
      @scrollY = @viewportModel.scrollY

    setPosition: ->
      animation = "walk#{@model.direction}#{@model.color}"

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
      @el.x = @intendedX + @offsetX + @scrollX
      @el.y = @intendedY + @offsetY + @scrollY

    dispose: ->
      @el.removeEventListener 'tick', @onTick

      EventBus.removeEventListener "!move#{@model.uniqueId}", @onModelMove, this
      EventBus.removeEventListener "!move:#{@viewportModel.uniqueId}", @setPosition, this

      @release()
