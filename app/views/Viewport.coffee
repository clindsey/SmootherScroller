require 'views/Tile'
require 'models/Tile'
require 'config'
require 'utils'

config = moduleLibrary.get 'config'
utils = moduleLibrary.get 'utils'

moduleLibrary.define 'Viewport.View', gamecore.Pooled.extend 'ViewportView',
    create: (viewportModel, tileMapModel) ->
      viewportView = @_super()

      _.bindAll viewportView, 'onClick', 'scrollerRender'

      viewportView.el = new createjs.Container

      viewportView.model = viewportModel
      viewportView.tileMapModel = tileMapModel

      viewportView.tileModels = @buildTileModels viewportView
      viewportView.tileViews = @buildTileViews viewportView
      viewportView.el.addChild(tileView.el) for tileView in viewportView.tileViews

      viewportModel = viewportView.model
      clientWidth = viewportModel.width * config.tileWidth
      clientHeight = viewportModel.height * config.tileHeight
      contentWidth = viewportModel.width * config.tileWidth * 3
      contentHeight = viewportModel.height * config.tileHeight * 3

      @buildScroller viewportView, clientWidth, clientHeight, contentWidth, contentHeight

      scroller = viewportView.scroller

      viewportView.scrollX = viewportModel.width * config.tileWidth
      viewportView.scrollY = viewportModel.height * config.tileHeight
      scroller.scrollTo viewportView.scrollX, viewportView.scrollY, false

      viewportView.indexOffsetX = Math.floor config.worldTileWidth / 2
      viewportView.indexOffsetY = Math.floor config.worldTileHeight / 2

      viewportView.el.on 'mousedown', (e) ->
        viewportView.scroller.doTouchStart [e.nativeEvent], +new Date

      viewportView.el.on 'pressmove', (e) ->
        viewportView.scroller.doTouchMove [e.nativeEvent], +new Date

      viewportView.el.on 'pressup', (e) ->
        scroller = viewportView.scroller

        scroller.doTouchEnd +new Date

        pos = scroller.getValues()
        diffX = Math.round (viewportView.scrollX - pos.left) / config.tileWidth
        diffY = Math.round (viewportView.scrollY - pos.top) / config.tileHeight
        viewportView.indexOffsetX -= diffX
        viewportView.indexOffsetY -= diffY

        viewportView.scrollX = viewportModel.width * config.tileWidth
        viewportView.scrollY = viewportModel.height * config.tileHeight

        scroller.scrollTo viewportView.scrollX, viewportView.scrollY

        viewportModel.setPosition viewportView.indexOffsetX, viewportView.indexOffsetY

      #EventBus.addEventListener '!key:down', viewportView.onKeyDown, viewportView

      EventBus.addEventListener "!move:#{viewportView.model.uniqueId}", viewportView.drawMap, viewportView

      #viewportView.el.addEventListener 'click', viewportView.onClick

      viewportView

    buildTileModels: (viewportView) ->
      tileMapModel = viewportView.tileMapModel
      viewportModel = viewportView.model
      tileMapData = tileMapModel.getArea viewportModel.width * 3, viewportModel.height * 3, viewportModel.x, viewportModel.y

      tileModels = []

      for y in [0..tileMapData.length - 1]
        for x in [0..tileMapData[y].length - 1]
          tileModel = (moduleLibrary.get 'Tile.Model').create tileMapData[y][x], x, y

          tileModels.push tileModel

      tileModels

    buildTileViews: (viewportView) ->
      views = []

      viewportModel = viewportView.model
      offsetX = viewportModel.width * config.tileWidth # offset is responsible for aligning content to viewport
      offsetY = viewportModel.height * config.tileHeight

      _.each viewportView.tileModels, (tileModel) ->
        tileView = (moduleLibrary.get 'Tile.View').create tileModel

        tileView.el.x = tileModel.x * config.tileWidth# - offsetX
        tileView.el.y = tileModel.y * config.tileHeight# - offsetY

        views.push tileView

      views

    buildScroller: (viewportView, clientWidth, clientHeight, contentWidth, contentHeight) ->
      viewportView.scroller = new Scroller viewportView.scrollerRender, animating: false, locking: false, zooming: true
      scroller = viewportView.scroller

      scroller.setDimensions clientWidth, clientHeight, contentWidth, contentHeight
  ,
    scrollerRender: (x, y, zoom) ->
      @el.x = 0 - x
      @el.y = 0 - y

      @indexOffsetX = utils.clamp @indexOffsetX, config.worldTileWidth
      @indexOffsetY = utils.clamp @indexOffsetY, config.worldTileHeight

      scrollX = @el.x
      scrollX += Math.floor(config.worldTileWidth / 4 + 4) * config.tileWidth
      scrollY = @el.y
      scrollY += Math.floor(config.worldTileHeight / 4 - 1) * config.tileHeight
      @model.setScroll scrollX, scrollY

    drawMap: ->
      tileMapData = @tileMapModel.getArea @model.width * 3, @model.height * 3, @model.x, @model.y

      for y in [0..tileMapData.length - 1]
        for x in [0..tileMapData[y].length - 1]
          tileModel = @tileModels[x + tileMapData[y].length * y]

          tileModel.setTileIndex tileMapData[y][x]

    onKeyDown: (_event, args) ->
      x = @model.x
      y = @model.y

      vx = 0
      vy = 0

      switch args.keyCode
        when 37
          vx = 0 - 1
        when 38
          vy = 0 - 1
        when 39
          vx = 1
        when 40
          vy = 1

      x = vx + @model.x
      y = vy + @model.y

      x = utils.clamp x, config.worldTileWidth
      y = utils.clamp y, config.worldTileHeight

      @model.setPosition x, y

    onClick: (event) ->
      x = Math.floor (event.stageX - @el.x) / config.tileWidth
      y = Math.floor (event.stageY - @el.y) / config.tileHeight

      halfWidth = Math.floor config.viewportOptions.width / 2
      halfHeight = Math.floor config.viewportOptions.height / 2

      newX = @model.x + (x - halfWidth)
      newY = @model.y + (y - halfHeight)

      @model.setPosition newX, newY

    dispose: ->
      _.invoke @tileModels, 'dispose'

      _.invoke @tileViews, 'dispose'

      EventBus.removeEventListener '!key:down', @onKeyDown, this

      @release()
