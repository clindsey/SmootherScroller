require 'config'

config = moduleLibrary.get 'config'

moduleLibrary.define 'Minimap.View', gamecore.Pooled.extend 'MinimapView',
    create: (tileMapModel, entityManagerView, viewportModel) ->
      minimapView = @_super()

      minimapView.viewportModel = viewportModel

      minimapView.lastUpdate = 0

      minimapView.el = new createjs.Container
      minimapView.el.x = config.viewportOptions.width * config.tileWidth

      minimapView.terrainEl = new createjs.Shape
      @buildTileViews minimapView, tileMapModel
      minimapView.el.addChild minimapView.terrainEl

      minimapView.entityManagerView = entityManagerView
      minimapView.entityEl = new createjs.Shape
      minimapView.el.addChild minimapView.entityEl

      _.bindAll minimapView, 'onClick'

      minimapView.el.addEventListener 'click', minimapView.onClick

      minimapView.buildEntityViews()

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

        el.graphics.beginFill(entityModel.minimapColor).drawRect(entityX, entityY, tileWidth, tileHeight)

      el.cache 0, 0, minimapWidth, minimapHeight

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
