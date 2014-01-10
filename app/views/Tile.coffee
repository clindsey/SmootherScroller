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

      color = switch
        when tileIndex < 1 then '#5489ab'
        when tileIndex < 3 then '#b7daf0'
        when tileIndex < 5 then '#e5d08d'
        when tileIndex < 7 then '#53b495'
        when tileIndex < 9 then '#148c69'
        else '#eaedf4'

      @el.graphics.clear().beginFill(color).drawRect 0, 0, config.tileWidth, config.tileHeight

    dispose: ->
      @release()
