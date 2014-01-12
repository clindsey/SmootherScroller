require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Creature.View', gamecore.Pooled.extend 'CreatureView',
    create: (creatureModel, viewportModel) ->
      creatureView = @_super()

      creatureView.offsetX = 0
      creatureView.offsetY = 0

      creatureView.model = creatureModel

      creatureView.viewportModel = viewportModel

      creatureView.spriteSheet = new createjs.SpriteSheet @spriteSheetOptions

      creatureView.el = new createjs.Sprite creatureView.spriteSheet

      creatureView.el.gotoAndPlay 'walkSouth'

      EventBus.addEventListener "!move:#{creatureModel.uniqueId}", creatureView.onModelMove, creatureView
      EventBus.addEventListener "!move:#{viewportModel.uniqueId}", creatureView.setPosition, creatureView

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
        walkEast:
          frames: [288, 289, 290, 291]
        walkNorth:
          frames: [292, 293, 294, 295]
        walkWest:
          frames: [296, 297, 298, 299]
        walkSouth:
          frames: [300, 301, 302, 303]
        idleEast:
          frames: [320, 321]
        idleNorth:
          frames: [322, 323]
        idleWest:
          frames: [324, 325]
        idleSouth:
          frames: [326, 327]
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
      animation = "walk#{@model.direction}"

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
      @el.removeEventListener 'tick', @onTick

      EventBus.removeEventListener "!move#{@model.uniqueId}", @onModelMove, this
      EventBus.removeEventListener "!move:#{@viewportModel.uniqueId}", @setPosition, this

      @release()
