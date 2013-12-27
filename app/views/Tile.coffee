require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Tile.View', gamecore.Pooled.extend 'TileView',
    create: (tileModel) ->
      tileView = @_super()

      tileView.model = tileModel

      tileView.el = new createjs.Bitmap utils.tilesetImage

      tileView.model.setIndexCallback ->
        tileView.setSpritePosition()

      tileView.setSpritePosition()

      tileView
  ,
    setSpritePosition: ->
      spriteSheetIndex = @model.spriteSheetIndex
      x = (spriteSheetIndex % config.tileWidth)
      y = Math.floor spriteSheetIndex / config.tileHeight

      @el.sourceRect = new createjs.Rectangle x * config.tileWidth, y * config.tileHeight, config.tileWidth, config.tileHeight

    dispose: ->
      @release()
