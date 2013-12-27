require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'TileMap.Model', gamecore.Pooled.extend 'TileMapModel',
    create: (tileSourceModelLocation, tileSourceModelName) ->
      tileMapModel = @_super()

      require tileSourceModelLocation

      tileMapModel.tileSourceModel = new (moduleLibrary.get tileSourceModelName)

      tileMapModel
  ,
    # returns a 2 dimensional array of tile indexes
    getArea: (sliceWidth, sliceHeight, centerX, centerY) ->
      data = []

      xOffset = Math.floor sliceWidth / 2
      yOffset = Math.floor sliceHeight / 2

      for y in [0..sliceHeight - 1]
        data[y] = []
        for x in [0..sliceWidth - 1]
          worldX = utils.clamp x - xOffset + centerX, config.worldTileWidth
          worldY = utils.clamp y - yOffset + centerY, config.worldTileHeight

          data[y][x] = @tileSourceModel.getCell worldX, worldY

      data

    dispose: ->
      @release()
