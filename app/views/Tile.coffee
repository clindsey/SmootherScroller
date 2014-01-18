require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Tile.View', gamecore.Pooled.extend 'TileView',
    create: (tileModel) ->
      tileView = @_super()

      tileView.model = tileModel

      tileView.el = new createjs.Bitmap utils.tilesetImg

      tileView.model.setIndexCallback ->
        tileView.setTileIndex()

      tileView.setTileIndex()

      tileView
  ,
    setTileIndex: ->
      tileIndex = @model.tileIndex

      x = (tileIndex % 16)
      y = Math.floor tileIndex / 16 # ground tileset is 16 tiles wide and tall

      tw = config.tileWidth
      th = config.tileHeight

      @el.sourceRect = new createjs.Rectangle x * tw, y * th, tw, th

    dispose: ->
      @release()
