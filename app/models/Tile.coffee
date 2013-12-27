moduleLibrary.define 'Tile.Model', gamecore.Pooled.extend 'TileModel',
    create: (spriteSheetIndex, x, y) ->
      tileModel = @_super()

      tileModel.spriteSheetIndex = spriteSheetIndex
      tileModel.x = x
      tileModel.y = y

      tileModel
  ,
    setSpriteSheetIndex: (newSpriteSheetIndex) ->
      if @spriteSheetIndex isnt newSpriteSheetIndex
        @spriteSheetIndex = newSpriteSheetIndex

        @onChangeSpriteSheetIndex()

    setIndexCallback: (newCallback) ->
      @onChangeSpriteSheetIndex = newCallback

    onChangeSpriteSheetIndex: ->
      # meant to be overridden

    dispose: ->
      @release()
