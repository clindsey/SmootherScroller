require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'TileMap.Model', gamecore.Pooled.extend 'TileMapModel',
    create: (tileSourceModelLocation, tileSourceModelName, tileSourceModelOptions) ->
      tileMapModel = @_super()

      tileMapModel.tileCache = []

      require tileSourceModelLocation

      tileMapModel.tileSourceModel = new (moduleLibrary.get tileSourceModelName) config.seed, tileSourceModelOptions

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

          data[y][x] = @getTile worldX, worldY

      data

    getPathfindingArea: (sliceWidth, sliceHeight, centerX, centerY) ->
      tileGrid = @getArea sliceWidth, sliceHeight, centerX, centerY

      data = []

      for tileGridRow, y in tileGrid
        data[y] = []

        for tileGridItem, x in tileGridRow
          data[y][x] = +!(tileGridItem is 0)

      data

    getCell: (worldX, worldY) ->
      @tileSourceModel.getCell worldX, worldY

    getTile: (worldX, worldY) ->
      if @tileCache[worldY] and @tileCache[worldY][worldX]?
        return @tileCache[worldY][worldX]

      cell = @tileSourceModel.getCell worldX, worldY
      neighbors = @collectNeighbors worldX, worldY
      index = @getIndexByNeighbors cell, neighbors

      @tileCache[worldY] ?= []
      @tileCache[worldY][worldX] = index

    collectNeighbors: (worldX, worldY) ->
      xl = config.worldTileWidth
      yl = config.worldTileHeight

      cx = (ox) -> utils.clamp ox, xl
      cy = (oy) -> utils.clamp oy, yl

      n  = @tileSourceModel.getCell cx(worldX - 0), cy(worldY - 1)
      e  = @tileSourceModel.getCell cx(worldX + 1), cy(worldY - 0)
      s  = @tileSourceModel.getCell cx(worldX - 0), cy(worldY + 1)
      w  = @tileSourceModel.getCell cx(worldX - 1), cy(worldY - 0)
      ne = @tileSourceModel.getCell cx(worldX + 1), cy(worldY - 1)
      se = @tileSourceModel.getCell cx(worldX + 1), cy(worldY + 1)
      sw = @tileSourceModel.getCell cx(worldX - 1), cy(worldY + 1)
      nw = @tileSourceModel.getCell cx(worldX - 1), cy(worldY - 1)

      [n, e, s, w, ne, se, sw, nw]

    cacheAllTiles: ->
      @tileSourceModel.cacheAllTiles()

    getIndexByNeighbors: (tileValue, neighbors) ->
      index = 0

      n  = neighbors[0]
      e  = neighbors[1]
      s  = neighbors[2]
      w  = neighbors[3]
      ne = neighbors[4]
      se = neighbors[5]
      sw = neighbors[6]
      nw = neighbors[7]

      if tileValue
        a = n << n * 4
        b = e << e * 5
        c = s << s * 6
        d = w << w * 7
        e = ne << ne * 0
        f = se << se * 1
        g = nw << nw * 3
        h = sw << sw * 2

        index = a + b + c + d + e + f + g + h

      index

    dispose: ->
      @tileSourceModel = undefined

      @release()
