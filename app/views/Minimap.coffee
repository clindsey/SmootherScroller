require 'config'

config = moduleLibrary.get 'config'

moduleLibrary.define 'Minimap.View', gamecore.Pooled.extend 'MinimapView',
    create: (tileMapModel, entityManagerView, viewportModel) ->
      minimapView = @_super()

      minimapView.viewportModel = viewportModel

      minimapView.lastUpdate = 0
      minimapView.scrollX = 0
      minimapView.scrollY = 0

      minimapView.el = new createjs.Container
      minimapView.el.x = config.tileWidth# * 1.5
      minimapView.el.y = config.tileHeight# * 1.5

      minimapView.el.shadow = new createjs.Shadow 'rgba(0, 0, 0, 0.6)', 1, 1, 0

      minimapView.terrainEl = new createjs.Shape
      @buildTileViews minimapView, tileMapModel
      minimapView.el.addChild minimapView.terrainEl

      minimapView.entityManagerView = entityManagerView
      minimapView.entityEl = new createjs.Shape
      minimapView.el.addChild minimapView.entityEl

      minimapView.overlayEl = new createjs.Shape
      minimapView.el.addChild minimapView.overlayEl

      _.bindAll minimapView, 'onClick'

      minimapView.el.addEventListener 'mousedown', minimapView.onClick

      minimapView.buildEntityViews()
      minimapView.drawOverlayView()

      EventBus.addEventListener "!move:#{viewportModel.uniqueId}", minimapView.drawOverlayView, minimapView
      EventBus.addEventListener "!scroll:#{viewportModel.uniqueId}", minimapView.setScroll, minimapView

      minimapView

    buildTileViews: (minimapView, tileMapModel) ->
      tileValues = tileMapModel.getArea config.worldTileWidth, config.worldTileHeight, Math.floor(config.worldTileWidth / 2), Math.floor(config.worldTileHeight / 2)

      tileWidth = config.minimapOptions.tileWidth
      tileHeight = config.minimapOptions.tileHeight

      for y in [0..tileValues.length - 1]
        for x in [0..tileValues[y].length - 1]
          tileValue = tileValues[y][x]

          color = if tileValue isnt 0 then '#00ff00' else '#0000ff'

          tileX = x * config.minimapOptions.tileWidth
          tileY = y * config.minimapOptions.tileHeight

          minimapView.terrainEl.graphics.beginFill(color).drawRect(tileX, tileY, tileWidth, tileHeight)

      minimapWidth = config.minimapOptions.tileWidth * config.worldTileWidth
      minimapHeight = config.minimapOptions.tileHeight * config.worldTileHeight

      minimapView.terrainEl.cache 0, 0, minimapWidth, minimapHeight
  ,
    buildEntityViews: ->
      entityModels = @entityManagerView.entityModels

      el = @entityEl

      el.graphics.clear()

      tileWidth = config.minimapOptions.tileWidth
      tileHeight = config.minimapOptions.tileHeight

      minimapWidth = config.minimapOptions.tileWidth * config.worldTileWidth
      minimapHeight = config.minimapOptions.tileHeight * config.worldTileHeight

      for entityModel in entityModels
        entityX = entityModel.x * tileWidth
        entityY = entityModel.y * tileHeight

        el.graphics.beginFill(entityModel.minimapColor).drawCircle(entityX, entityY, tileWidth)

      el.cache 0, 0, minimapWidth, minimapHeight

    setScroll: ->
      @scrollX = (@viewportModel.scrollX) * (config.minimapOptions.tileWidth / config.tileWidth)
      @scrollY = (@viewportModel.scrollY) * (config.minimapOptions.tileHeight / config.tileHeight)

      @drawOverlayView()

    drawOverlayView: ->
      el = @overlayEl

      width = config.viewportOptions.width * config.minimapOptions.tileWidth
      height = config.viewportOptions.height * config.minimapOptions.tileHeight

      halfWidth = Math.floor width / 2
      halfHeight = Math.floor height / 2

      x = (@viewportModel.x * config.minimapOptions.tileWidth) - halfWidth
      y = (@viewportModel.y * config.minimapOptions.tileHeight) - halfHeight

      x -= @scrollX
      y -= @scrollY

      w = config.worldTileWidth * config.minimapOptions.tileWidth
      h = config.worldTileHeight * config.minimapOptions.tileHeight

      el.shadow = new createjs.Shadow '#000000', 1, 1, 0

      g = el.graphics
      g.clear()
      g.setStrokeStyle(2, 'square')
      g.beginStroke('rgba(255, 255, 0, 0.6)')

      g.drawRect x, y, width, height # center
      g.drawRect x - w, y, width, height # west
      g.drawRect x - w, y - h, width, height # north west
      g.drawRect x + w, y, width, height # east
      g.drawRect x + w, y - h, width, height # north east
      g.drawRect x + w, y + h, width, height # south east
      g.drawRect x - w, y + h, width, height # south west
      g.drawRect x, y + h, width, height # south
      g.drawRect x, y - h, width, height # north

      el.cache 0, 0, w, h

    onTick: (event) ->
      timeDelta = event.time - @lastUpdate

      if Math.floor(timeDelta / 500) >= 1
        @buildEntityViews()

        @lastUpdate = event.time

    onClick: (event) ->
      x = Math.floor (event.stageX - @el.x) / config.minimapOptions.tileWidth
      y = Math.floor (event.stageY - @el.y) / config.minimapOptions.tileHeight

      @viewportModel.setPosition x, y

    dispose: ->
      @el.removeEventListener 'click', @onClick

      @release()
