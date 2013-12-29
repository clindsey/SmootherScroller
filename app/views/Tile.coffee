require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Tile.View', gamecore.Pooled.extend 'TileView',
    create: (tileModel) ->
      tileView = @_super()

      tileView.model = tileModel

      tileView.el = new createjs.Shape()
      tileView.setTileIndex()

      tileView.model.setIndexCallback ->
        tileView.setTileIndex()

      tileView
  ,
    setTileIndex: ->
      tileIndex = @model.tileIndex

      #color = @indexToColor tileIndex

      color = switch
        when tileIndex < 1 then '#5489ab'
        when tileIndex < 3 then '#b7daf0'
        when tileIndex < 5 then '#e5d08d'
        when tileIndex < 7 then '#53b495'
        when tileIndex < 9 then '#148c69'
        else '#eaedf4'

      @el.graphics.beginFill(color).drawRect 0, 0, config.tileWidth, config.tileHeight

    indexToColor: (index) ->
      c = Math.floor (255 * index) / config.maxElevation

      r = c << 16
      g = c << 8
      b = c

      sum = r + g + b

      out = sum.toString 16

      out = '000000' if out is '0'

      "##{out}"

    dispose: ->
      @release()
