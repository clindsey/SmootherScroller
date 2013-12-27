moduleLibrary.define 'Tile.Model', gamecore.Pooled.extend 'TileModel',
    create: (tileIndex, x, y) ->
      tileModel = @_super()

      tileModel.tileIndex = tileIndex
      tileModel.x = x
      tileModel.y = y

      tileModel
  ,
    setTileIndex: (newTileIndex) ->
      if @tileIndex isnt newTileIndex
        @tileIndex = newTileIndex

        @onChangeTileIndex()

    setIndexCallback: (newCallback) ->
      @onChangeTileIndex = newCallback

    onChangeTileIndex: ->
      # meant to be overridden

    dispose: ->
      @release()
