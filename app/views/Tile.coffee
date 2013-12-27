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
        when tileIndex < 3 then '#0000ff'
        when tileIndex < 8 then '#00ff00'
        else '#cccccc'

      @el.graphics.beginFill(color).drawRect 0, 0, config.tileWidth, config.tileHeight

    dispose: ->
      @release()
