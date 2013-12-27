require 'views/Tile'
require 'models/Tile'
require 'config'
require 'utils'

config = moduleLibrary.get 'config'
utils = moduleLibrary.get 'utils'

moduleLibrary.define 'Viewport.View', gamecore.Pooled.extend 'ViewportView',
    create: (viewportModel, tileMapModel) ->
      viewportView = @_super()

      viewportView.el = new createjs.Container

      viewportView.model = viewportModel
      viewportView.tileMapModel = tileMapModel

      viewportView.tileModels = @buildTileModels viewportView
      viewportView.tileViews = @buildTileViews viewportView
      viewportView.el.addChild(tileView.el) for tileView in viewportView.tileViews

      EventBus.addEventListener '!key:down', viewportView.onKeyDown, viewportView

      EventBus.addEventListener "!move:#{viewportView.model.uniqueId}", viewportView.drawMap, viewportView

      viewportView

    buildTileModels: (viewportView) ->
      tileMapModel = viewportView.tileMapModel
      viewportModel = viewportView.model
      tileMapData = tileMapModel.getArea viewportModel.width, viewportModel.height, viewportModel.x, viewportModel.y

      tileModels = []

      for y in [0..tileMapData.length - 1]
        for x in [0..tileMapData[y].length - 1]
          tileModel = (moduleLibrary.get 'Tile.Model').create tileMapData[y][x], x, y

          tileModels.push tileModel

      tileModels

    buildTileViews: (viewportView) ->
      views = []

      _.each viewportView.tileModels, (tileModel) ->
        tileView = (moduleLibrary.get 'Tile.View').create tileModel

        tileView.el.x = tileModel.x * config.tileWidth
        tileView.el.y = tileModel.y * config.tileHeight

        views.push tileView

      views
  ,
    drawMap: ->
      tileMapData = @tileMapModel.getArea @model.width, @model.height, @model.x, @model.y

      for y in [0..tileMapData.length - 1]
        for x in [0..tileMapData[y].length - 1]
          tileModel = @tileModels[x + tileMapData[y].length * y]

          tileModel.setSpriteSheetIndex tileMapData[y][x]

    onKeyDown: (_event, args) ->
      x = @model.x
      y = @model.y

      switch args.keyCode
        when 37
          x = @model.x - 1
        when 38
          y = @model.y - 1
        when 39
          x = @model.x + 1
        when 40
          y = @model.y + 1

      x = utils.clamp x, config.worldTileWidth
      y = utils.clamp y, config.worldTileHeight

      @model.setPosition x, y

    dispose: ->
      _.invoke @tileModels, 'dispose'

      _.invoke @tileViews, 'dispose'

      EventBus.removeEventListener '!key:down', @onKeyDown, this

      @release()
